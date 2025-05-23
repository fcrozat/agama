// Copyright (c) [2024] SUSE LLC
//
// All Rights Reserved.
//
// This program is free software; you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the Free
// Software Foundation; either version 2 of the License, or (at your option)
// any later version.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
// more details.
//
// You should have received a copy of the GNU General Public License along
// with this program; if not, contact SUSE LLC.
//
// To contact SUSE LLC about this file by physical or electronic mail, you may
// find current contact information at www.suse.com.

use agama_lib::manager::FinishMethod;
use anyhow::{anyhow, Context};
use clap::{Args, Parser};

mod auth;
mod commands;
mod config;
mod error;
mod logs;
mod profile;
mod progress;
mod questions;

use crate::error::CliError;
use agama_lib::base_http_client::BaseHTTPClient;
use agama_lib::{
    error::ServiceError, manager::ManagerClient, progress::ProgressMonitor, utils::Transfer,
};
use auth::run as run_auth_cmd;
use commands::Commands;
use config::run as run_config_cmd;
use inquire::Confirm;
use logs::run as run_logs_cmd;
use profile::run as run_profile_cmd;
use progress::InstallerProgress;
use questions::run as run_questions_cmd;
use std::fs;
use std::os::unix::fs::OpenOptionsExt;
use std::path::PathBuf;
use std::{
    collections::HashMap,
    process::{ExitCode, Termination},
    thread::sleep,
    time::Duration,
};
use url::Url;

/// Agama's CLI global options
#[derive(Args)]
pub struct GlobalOpts {
    #[clap(long, default_value = "http://localhost/api")]
    /// URI pointing to Agama's remote API. If not provided, default https://localhost/api is
    /// used
    pub api: String,

    #[clap(long, default_value = "false")]
    /// Whether to accept invalid (self-signed, ...) certificates or not
    pub insecure: bool,
}

/// Agama's command-line interface
///
/// This program allows inspecting or changing Agama's configuration, handling installation
/// profiles, starting the installation, monitoring the process, etc.
///
/// Please, use the "help" command to learn more.
#[derive(Parser)]
#[command(name = "agama", about, long_about, max_term_width = 100)]
pub struct Cli {
    #[clap(flatten)]
    pub opts: GlobalOpts,

    #[command(subcommand)]
    pub command: Commands,
}

async fn probe() -> anyhow::Result<()> {
    let another_manager = build_manager().await?;
    let probe = tokio::spawn(async move {
        let _ = another_manager.probe().await;
    });
    show_progress().await?;

    Ok(probe.await?)
}

/// Starts the installation process
///
/// Before starting, it makes sure that the manager is idle.
///
/// * `manager`: the manager client.
async fn install(manager: &ManagerClient<'_>, max_attempts: u8) -> anyhow::Result<()> {
    if manager.is_busy().await {
        println!("Agama's manager is busy. Waiting until it is ready...");
    }

    // Make sure that the manager is ready
    manager.wait().await?;

    if !manager.can_install().await? {
        return Err(CliError::Validation)?;
    }

    let progress = tokio::spawn(async { show_progress().await });
    // Try to start the installation up to max_attempts times.
    let mut attempts = 1;
    loop {
        match manager.install().await {
            Ok(()) => break,
            Err(e) => {
                eprintln!(
                    "Could not start the installation process: {e}. Attempt {}/{}.",
                    attempts, max_attempts
                );
            }
        }
        if attempts == max_attempts {
            eprintln!("Giving up.");
            return Err(CliError::Installation)?;
        }
        attempts += 1;
        sleep(Duration::from_secs(1));
    }
    let _ = progress.await;
    Ok(())
}

/// Finish the instalation with the given method
///
/// Before finishing, it makes sure that the manager is idle.
///
/// * `manager`: the manager client.
async fn finish(manager: &ManagerClient<'_>, method: FinishMethod) -> anyhow::Result<()> {
    if manager.is_busy().await {
        println!("Agama's manager is busy. Waiting until it is ready...");
    }

    // Make sure that the manager is ready
    manager.wait().await?;
    if !manager.finish(method).await? {
        eprintln!("Cannot finish the installation ({method})");
        return Err(CliError::NotFinished)?;
    }
    Ok(())
}

/// If D-Bus indicates that the backend is busy, show it on the terminal
async fn show_progress() -> Result<(), ServiceError> {
    // wait 1 second to give other task chance to start, so progress can display something
    tokio::time::sleep(Duration::from_secs(1)).await;
    let conn = agama_lib::connection().await?;
    let mut monitor = ProgressMonitor::new(conn).await?;
    let terminal_presenter = InstallerProgress::new();
    monitor
        .run(terminal_presenter)
        .await
        .expect("failed to monitor the progress");
    Ok(())
}

async fn wait_for_services(manager: &ManagerClient<'_>) -> Result<(), ServiceError> {
    let services = manager.busy_services().await?;
    // TODO: having it optional
    if !services.is_empty() {
        eprintln!("The Agama service is busy. Waiting for it to be available...");
        show_progress().await?
    }
    Ok(())
}

async fn build_manager<'a>() -> anyhow::Result<ManagerClient<'a>> {
    let conn = agama_lib::connection().await?;
    Ok(ManagerClient::new(conn).await?)
}

/// True if use of the remote API is allowed (yes by default when the API is secure, the user is
/// asked if the API is insecure - e.g. when it uses self-signed certificate)
async fn allowed_insecure_api(use_insecure: bool, api_url: &str) -> Result<bool, ServiceError> {
    // fake client used for remote site detection
    let mut ping_client = BaseHTTPClient::default();
    ping_client.base_url = api_url.to_string();

    // decide whether access to remote site has to be insecure (self-signed certificate or not)
    match ping_client.get::<HashMap<String, String>>("/ping").await {
        // Problem with http remote API reachability
        Err(ServiceError::HTTPError(_)) => Ok(use_insecure || Confirm::new("There was a problem with the remote API and it is treated as insecure. Do you want to continue?")
            .with_default(false)
            .prompt()
            .unwrap_or(false)),
        // another error
        Err(e) => Err(e),
        // success doesn't bother us here
        Ok(_) => Ok(false)
    }
}

pub fn download_file(url: &str, path: &PathBuf) -> Result<(), ServiceError> {
    let mut file = fs::OpenOptions::new()
        .create(true)
        .write(true)
        .mode(0o400)
        .open(path)
        .context(format!("Cannot write the file '{}'", path.display()))?;

    match Transfer::get(url, &mut file) {
        Ok(()) => println!("File saved to {}", path.display()),
        Err(e) => eprintln!("Could not retrieve the file: {e}"),
    }
    Ok(())
}

async fn build_http_client(
    api_url: &str,
    insecure: bool,
    authenticated: bool,
) -> Result<BaseHTTPClient, ServiceError> {
    let parsed = Url::parse(&api_url).context("Parsing API URL")?;
    if parsed.cannot_be_a_base() {
        return Err(ServiceError::Anyhow(anyhow!(
            "Do not try data: or mailto: as the API URL"
        )));
    }

    let mut client = BaseHTTPClient::default();
    client.base_url = api_url.to_string();

    if allowed_insecure_api(insecure, &client.base_url).await? {
        client = client.insecure();
    }

    // we need to distinguish commands on those which assume that authentication JWT is already
    // available and those which not (or don't need it)
    if authenticated {
        // this deals with authentication need inside
        client.authenticated()
    } else {
        client.unauthenticated()
    }
}

pub async fn run_command(cli: Cli) -> Result<(), ServiceError> {
    // somehow check whether we need to ask user for self-signed certificate acceptance

    let api_url = cli.opts.api.trim_end_matches('/').to_string();

    match cli.command {
        Commands::Config(subcommand) => {
            let client = build_http_client(&api_url, cli.opts.insecure, true).await?;
            run_config_cmd(client, subcommand).await?
        }
        Commands::Probe => {
            let manager = build_manager().await?;
            wait_for_services(&manager).await?;
            probe().await?
        }
        Commands::Profile(subcommand) => {
            let client = build_http_client(&api_url, cli.opts.insecure, true).await?;
            run_profile_cmd(client, subcommand).await?;
        }
        Commands::Install => {
            let manager = build_manager().await?;
            install(&manager, 3).await?
        }
        Commands::Finish { method } => {
            let manager = build_manager().await?;
            let method = method.unwrap_or_default();
            finish(&manager, method).await?;
        }
        Commands::Questions(subcommand) => {
            let client = build_http_client(&api_url, cli.opts.insecure, true).await?;
            run_questions_cmd(client, subcommand).await?
        }
        Commands::Logs(subcommand) => {
            let client = build_http_client(&api_url, cli.opts.insecure, true).await?;
            run_logs_cmd(client, subcommand).await?
        }
        Commands::Download { url, destination } => download_file(&url, &destination)?,
        Commands::Auth(subcommand) => {
            let client = build_http_client(&api_url, cli.opts.insecure, false).await?;
            run_auth_cmd(client, subcommand).await?;
        }
    };

    Ok(())
}

/// Represents the result of execution.
pub enum CliResult {
    /// Successful execution.
    Ok = 0,
    /// Something went wrong.
    Error = 1,
}

impl Termination for CliResult {
    fn report(self) -> ExitCode {
        ExitCode::from(self as u8)
    }
}
