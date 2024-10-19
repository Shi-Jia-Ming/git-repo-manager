use git2::Repository;
use serde::Serialize;
use tauri::command;
use std::fs;
use std::path::Path;

#[derive(Serialize, Debug)]
pub struct RepoInfo {
    name: String,
    path: String,
}

#[command]
pub fn scan_repo(path: &str) -> Vec<RepoInfo> {
    // scan the sub dir of the path
    let mut repo_list: Vec<RepoInfo>  = Vec::new();
    let path = Path::new(path);
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries {
            if let Ok(entry) = entry {
                let sub_path = entry.path();
                if sub_path.is_dir() {
                    if let Some(file_name) = sub_path.file_name() {
                        if let Some(first_char) = file_name.to_str().and_then(|s| s.chars().next()) {
                            if first_char != '.' {
                                repo_list.push(match Repository::open(&sub_path) {
                                    Ok(_repo) => {
                                        RepoInfo {
                                            name: file_name.to_str().unwrap().to_string(),
                                            path: sub_path.to_str().unwrap().to_string(),
                                        }
                                    },
                                    Err(_e) => {
                                        continue;
                                    },
                                });
                            }
                        }
                    }
                }
            }
        }
    } else {
        println!("无法读取目录: {:?}", path);
    }
    repo_list
}