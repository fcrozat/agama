// Copyright (c) [2025] SUSE LLC
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

//! File transfer API for Agama.
//!
//! Implement a file transfer API which, at this point, partially supports Agama specific URLs. Check the
//! YaST document about [URL handling in the
//! installer](https://github.com/yast/yast-installation/blob/master/doc/url.md) for further
//! information.
//!
//! At this point, it only supports those schemes supported by CURL.

use std::{
    io::Write,
    path::{Path, PathBuf},
    process::Command,
};

use curl::easy::Easy;
use thiserror::Error;
use url::Url;

mod file_systems;

use file_systems::{FileSystem, FileSystemFinder};

#[derive(Error, Debug)]
pub enum TransferError {
    #[error("Could not retrieve the file: {0}")]
    CurlError(#[from] curl::Error),
    #[error("Could not parse the URL: {0}")]
    ParseError(#[from] url::ParseError),
    #[error("File not found: {0}")]
    FileNotFound(String),
    #[error("IO error: {0}")]
    IO(#[from] std::io::Error),
    #[error("Could not mount the file system {0}")]
    FileSystemMount(String),
}
pub type TransferResult<T> = Result<T, TransferError>;

/// File transfer API
pub struct Transfer {}

impl Transfer {
    /// Retrieves and writes the data from an URL
    ///
    /// * `url`: URL to get the data from.
    /// * `out_fd`: where to write the data.
    pub fn get(url: &str, out_fd: &mut impl Write) -> TransferResult<()> {
        let url = Url::parse(url)?;
        match url.scheme() {
            "device" | "usb" => DeviceHandler::get(url, out_fd),
            _ => GenericHandler::get(&url.to_string(), out_fd),
        }
    }
}

/// Generic handler to retrieve any URL.
///
/// It uses curl under the hood.
pub struct GenericHandler {}

impl GenericHandler {
    pub fn get(url: &str, mut out_fd: impl Write) -> TransferResult<()> {
        let mut handle = Easy::new();
        handle.follow_location(true)?;
        handle.fail_on_error(true)?;
        handle.url(url)?;

        let mut transfer = handle.transfer();
        transfer.write_function(|buf| Ok(out_fd.write(buf).unwrap()))?;
        transfer.perform()?;
        Ok(())
    }
}

/// Handler to process AutoYaST-like URLs of type "device" and "usb".
///
/// 1. Search for the file systems.
///   * If host is empty, search for all potential file systems.
///   * If host is given, select the file system
/// 2. Search for the file in each file system
///   * Mount the file system (if not mounted)
///   * Transfer the file if found
//   * Umount th file system (if it was not mounted)
pub struct DeviceHandler {}

impl DeviceHandler {
    pub fn get(url: Url, out_fd: &mut impl Write) -> TransferResult<()> {
        let mut finder = FileSystemFinder::from_system();
        if let Some(host) = url.host_str() {
            finder.by_name(host); // + path
        }

        if url.scheme() == "usb" {
            finder.by_transport("usb");
        }

        let file_name = url.path();
        LocalTransfer::find_and_copy_files(&finder.find(), &file_name, out_fd)
    }
}

/// Transfer a file from a local file system, mounting and unmounting it as required.
struct LocalTransfer {}

impl LocalTransfer {
    pub fn find_and_copy_files(
        file_systems: &[FileSystem],
        file_name: &str,
        writer: &mut impl Write,
    ) -> TransferResult<()> {
        for fs in file_systems {
            if LocalTransfer::find_and_copy_file(fs, &file_name, writer).is_ok() {
                return Ok(());
            }
        }
        Err(TransferError::FileNotFound(file_name.to_string()))
    }
    // TODO: it should receive a vector of file systems to search on. So the handlers would only
    // need to search for the file systems.
    pub fn find_and_copy_file(
        file_system: &FileSystem,
        file_name: &str,
        writer: &mut impl Write,
    ) -> TransferResult<()> {
        const DEFAULT_MOUNT_PATH: &str = "/run/agama/mount";
        let default_mount_point = PathBuf::from(DEFAULT_MOUNT_PATH);
        let mount_point = file_system
            .mount_point
            .clone()
            .unwrap_or(default_mount_point);

        if !file_system.is_mounted() {
            Self::mount_file_system(&file_system, &mount_point)?;
        }

        let file_name = file_name.strip_prefix("/").unwrap_or(file_name);
        let source = mount_point.join(&file_name);
        let result = Self::copy_file(source, writer);

        if !file_system.is_mounted() {
            Self::umount_file_system(&mount_point)?;
        }

        result
    }

    /// Mounts the file system on a given point.
    fn mount_file_system(file_system: &FileSystem, mount_point: &PathBuf) -> TransferResult<()> {
        std::fs::create_dir_all(mount_point)?;
        let output = Command::new("mount")
            .args([file_system.device(), mount_point.display().to_string()])
            .output()?;
        if !output.status.success() {
            return Err(TransferError::FileSystemMount(file_system.device()));
        }
        Ok(())
    }

    /// Reads and write the file content to the given writer.
    fn copy_file<P: AsRef<Path>>(source: P, out_fd: &mut impl Write) -> TransferResult<()> {
        let mut reader = std::fs::File::open(source)?;
        std::io::copy(&mut reader, out_fd)?;
        Ok(())
    }

    /// Umounts file system from the given mount point.
    fn umount_file_system(mount_point: &PathBuf) -> TransferResult<()> {
        Command::new("umount")
            .arg(mount_point.display().to_string())
            .output()?;
        Ok(())
    }
}
