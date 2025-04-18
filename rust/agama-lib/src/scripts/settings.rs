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

use serde::{Deserialize, Serialize};

use super::{InitScript, PostPartitioningScript, PostScript, PreScript};

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScriptsConfig {
    /// User-defined pre-installation scripts
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pre: Option<Vec<PreScript>>,
    /// User-defined post-partitioning scripts
    #[serde(skip_serializing_if = "Option::is_none")]
    pub post_partitioning: Option<Vec<PostPartitioningScript>>,
    /// User-defined post-installation scripts
    #[serde(skip_serializing_if = "Option::is_none")]
    pub post: Option<Vec<PostScript>>,
    /// User-defined init scripts
    #[serde(skip_serializing_if = "Option::is_none")]
    pub init: Option<Vec<InitScript>>,
}

impl ScriptsConfig {
    pub fn to_option(self) -> Option<Self> {
        if self.pre.is_none()
            && self.post_partitioning.is_none()
            && self.post.is_none()
            && self.init.is_none()
        {
            None
        } else {
            Some(self)
        }
    }
}
