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

//! Implements the store for the bootloader settings.

use crate::base_http_client::BaseHTTPClient;
use crate::error::ServiceError;

use super::client::FilesClient;
use super::model::UserFile;
/// Loads and stores the files settings from/to the HTTP service.
pub struct FilesStore {
    files_client: FilesClient,
}

impl FilesStore {
    pub fn new(client: BaseHTTPClient) -> Result<Self, ServiceError> {
        Ok(Self {
            files_client: FilesClient::new(client),
        })
    }

    /// loads the list of user files from http API
    pub async fn load(&self) -> Result<Option<Vec<UserFile>>, ServiceError> {
        let res = self.files_client.get_files().await?;
        if res.is_empty() {
            Ok(None)
        } else {
            Ok(Some(res))
        }
    }

    /// stores the list of user files via http API
    pub async fn store(&self, files: &Vec<UserFile>) -> Result<(), ServiceError> {
        self.files_client.set_files(files).await?;
        Ok(())
    }
}
