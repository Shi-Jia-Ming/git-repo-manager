use git2::Repository;
use rusqlite::Connection;
use std::fs;
use std::path::Path;
use tauri::command;

use crate::database::{
    index::{get_db_connection, init_database},
    module::repo_info::{insert_repo, select_repo, RepoInfo},
};

use super::workspace::{init_workspace, is_new_workspace};

#[command]
pub fn scan_repo(path: &str) -> Vec<RepoInfo> {
    if path.is_empty() {
        return Vec::new();
    }
    let connection: Connection = get_db_connection(path).expect("failed to generate db connection");
    // scan the sub dir of the path
    let mut repo_list: Vec<RepoInfo> = Vec::new();
    let path = Path::new(path);
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries {
            if let Ok(entry) = entry {
                let sub_path = entry.path();
                if sub_path.is_dir() {
                    if let Some(file_name) = sub_path.file_name() {
                        if let Some(first_char) = file_name.to_str().and_then(|s| s.chars().next())
                        {
                            if first_char != '.' {
                                repo_list.push(match Repository::open(&sub_path) {
                                    Ok(_repo) => {
                                        let repo_info = RepoInfo {
                                            id: (&repo_list).len() as i32,
                                            name: file_name.to_str().unwrap().to_string(),
                                            path: sub_path.to_str().unwrap().to_string(),
                                        };
                                        insert_repo(&repo_info, &connection).expect("Failed to insert repo information in function scan_repo()");
                                        repo_info
                                    }
                                    Err(_e) => {
                                        continue;
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    repo_list
}

#[command]
pub fn load_repo_list(path: &str) -> Vec<RepoInfo> {
    if path.is_empty() {
        return Vec::new();
    }
    let repo_list: Vec<RepoInfo>;
    if is_new_workspace(path) {
        init_workspace(path).expect("failed to init workspace");
        let _ = init_database(path).expect("failed to init database");
        repo_list = scan_repo(path);
    } else {
        let connection = get_db_connection(path).expect("failed to generate db connection");
        repo_list = select_repo(&connection).expect("failed to select repo");
    }

    repo_list
}

#[command]
pub fn get_readme(repo_path: &str) -> String {
    let repo = Repository::open(repo_path).expect("failed to open repo");
    let head = repo.head().expect("failed to get head");
    let head_commit = head.peel_to_commit().expect("failed to peel to commit");
    let tree = head_commit.tree().expect("failed to get tree");

    // 尝试匹配 README.md 或 readme.md
    let readme_path = if tree.get_path(Path::new("README.md")).is_ok() {
        Path::new("README.md")
    } else if tree.get_path(Path::new("readme.md")).is_ok() {
        Path::new("readme.md")
    } else {
        return String::from("未找到 README.md 或 readme.md 文件");
    };

    let readme = tree
        .get_path(readme_path)
        .expect("failed to get README file");
    let blob = readme.to_object(&repo).expect("failed to get object");
    let content = blob.as_blob().expect("failed to get blob").content();
    String::from_utf8(content.to_vec()).expect("failed to convert to string")
}
