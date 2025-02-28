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

/// Module to search for file systems.
use std::{path::PathBuf, process::Command};

/// Represents a file system from the underlying system.
///
/// It only includes the elements that are relevant for the transfer API.
#[derive(Clone, Debug, Default)]
pub struct FileSystem {
    pub block_device: String,
    pub fstype: String,
    pub mount_point: Option<PathBuf>,
    pub transport: Option<String>,
    pub label: Option<String>,
}

impl FileSystem {
    /// Whether the file system was mounted.
    pub fn is_mounted(&self) -> bool {
        self.mount_point.is_some()
    }

    /// Kernel name of the block device containing the file system.
    pub fn device(&self) -> String {
        format!("/dev/{}", &self.block_device)
    }

    /// Whether the file system can be mounted.
    ///
    /// File systems that cannot be mounted are ignored.
    fn can_be_mounted(&self) -> bool {
        match self.fstype.as_str() {
            "" | "crypto_LUKS" | "swap" => false,
            _ => true,
        }
    }
}

/// Searches for file systems.
///
/// It searches all file system, allowing to narrow the search by filtering for any
/// given criteria.
#[derive(Debug)]
pub struct FileSystemFinder {
    file_systems: Vec<FileSystem>,
    name: Option<String>,
    transport: Option<String>,
}

impl FileSystemFinder {
    /// Creates a finde for the given set of file systems.
    pub fn new(file_systems: Vec<FileSystem>) -> Self {
        Self {
            file_systems,
            name: None,
            transport: None,
        }
    }

    /// Creates a finder for the file systems in the underlying system.
    pub fn from_system() -> Self {
        let file_systems = FileSystemsReader::read_from_system();
        Self::new(file_systems)
    }

    /// Sets the given name as search criteria.
    ///
    /// * `name`: name of the device
    pub fn by_name(&mut self, name: &str) {
        self.name = Some(name.to_string())
    }

    /// Sets the given transport as search criteria.
    ///
    /// * `transport`: transport of the device
    pub fn by_transport(&mut self, transport: &str) {
        self.transport = Some(transport.to_string())
    }

    /// Finds the file systems which match the given criteria.
    ///
    /// If not criteria was set, it returns all the file systems.
    pub fn find(&self) -> Vec<FileSystem> {
        self.file_systems
            .iter()
            .filter_map(|fs| {
                if self.name.as_ref().is_some_and(|n| n != &fs.block_device) {
                    return None;
                }

                if let Some(transport) = self.transport.as_ref() {
                    let Some(fs_transport) = &fs.transport else {
                        return None;
                    };

                    if fs_transport != transport {
                        return None;
                    }
                }

                Some(fs.clone())
            })
            .collect()
    }
}

/// Implements the logic to read the file systems from the underlying system.
///
/// This struct relies on lsblk to find the file systems. It is extracted to
/// a separate struct to make testing easier.
struct FileSystemsReader {}

impl FileSystemsReader {
    /// Returns the file systems from the underlying system.
    pub fn read_from_system() -> Vec<FileSystem> {
        let lsblk = Command::new("lsblk")
            .args([
                "--output",
                "KNAME,FSTYPE,MOUNTPOINT,TRAN,LABEL",
                "--noheading",
                "--raw",
            ])
            .output()
            .unwrap();
        let output = String::from_utf8_lossy(&lsblk.stdout);
        Self::read_from_string(&output)
    }

    /// Turns the output of lsblk into a list of file systems.
    pub fn read_from_string(lsblk_string: &str) -> Vec<FileSystem> {
        let mut file_systems = vec![];
        let mut transport = None;
        for line in lsblk_string.lines() {
            if let Some(mut file_system) = Self::build_file_system(&line) {
                if file_system.transport.is_none() {
                    file_system.transport = transport.clone();
                } else {
                    transport = file_system.transport.clone();
                }
                if file_system.can_be_mounted() {
                    file_systems.push(file_system);
                }
            }
        }
        file_systems
    }

    /// Ancillary function to build a file system from a lsblk entry.
    fn build_file_system(line: &str) -> Option<FileSystem> {
        let mut parts = line.split(' ');
        let block_device = parts.next()?.to_string();
        let fstype = parts.next()?.to_string();
        let mount_point = parts.next()?.to_string();
        let transport = parts.next()?.to_string();
        let label = parts.next()?.to_string();

        Some(FileSystem {
            block_device: block_device.to_string(),
            fstype: fstype.to_string(),
            mount_point: if mount_point.is_empty() {
                None
            } else {
                Some(PathBuf::from(mount_point))
            },
            transport: if transport.is_empty() {
                None
            } else {
                Some(transport)
            },
            label: if label.is_empty() { None } else { Some(label) },
        })
    }
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use super::{FileSystem, FileSystemFinder, FileSystemsReader};

    fn build_file_systems() -> Vec<FileSystem> {
        let vda1 = FileSystem {
            block_device: "vda1".to_string(),
            fstype: "ext4".to_string(),
            mount_point: Some(PathBuf::from("/")),
            ..Default::default()
        };
        let vdb1 = FileSystem {
            block_device: "vdb1".to_string(),
            fstype: "xfs".to_string(),
            mount_point: Some(PathBuf::from("/home")),
            ..Default::default()
        };
        let usb = FileSystem {
            block_device: "sr0".to_string(),
            fstype: "vfat".to_string(),
            mount_point: None,
            transport: Some("usb".to_string()),
            ..Default::default()
        };
        vec![vda1, vdb1, usb]
    }

    #[test]
    fn test_find_file_system_by_name() {
        let file_systems = build_file_systems();
        let mut finder = FileSystemFinder::new(file_systems);
        finder.by_name("vdb1");

        let found = finder.find();
        let vdb1 = found.first().unwrap();
        assert_eq!(&vdb1.block_device, "vdb1");
    }

    #[test]
    fn test_find_file_system_by_transport() {
        let file_systems = build_file_systems();
        let mut finder = FileSystemFinder::new(file_systems);
        finder.by_transport("usb");

        let found = finder.find();
        let vdb1 = found.first().unwrap();
        assert_eq!(&vdb1.block_device, "sr0");
    }

    #[test]
    fn test_find_all() {
        let file_systems = build_file_systems();
        let finder = FileSystemFinder::new(file_systems);
        let all = finder.find();
        assert_eq!(all.len(), 3);
    }

    #[test]
    fn test_parse_file_systems() {
        let lsblk = r#"sda iso9660  usb agama-installer
sda1 iso9660 /run/media/imobach/agama-installer  agama-installer
sda2 vfat   BOOT
nvme0n1   nvme 
nvme0n1p1 vfat /boot/efi nvme 
nvme0n1p2 crypto_LUKS  nvme 
dm-0 btrfs /usr/local 
nvme0n1p3 crypto_LUKS  nvme 
dm-1 swap [SWAP] 
            "#;
        let file_systems = FileSystemsReader::read_from_string(&lsblk);
        dbg!(&file_systems);
        assert_eq!(file_systems.len(), 4)
    }
}
