use git2::Repository;
use rusqlite::Connection;
use serde::Serialize;
use std::fs;
use std::path::Path;
use tauri::command;

use crate::service::workspace::init_database;

use super::workspace::{generate_db_connection, is_new_workspace};

#[derive(Serialize, Debug)]
pub struct RepoInfo {
    id: i32,
    name: String,
    path: String,
}

pub fn insert_repo(repo: &RepoInfo, connection: &Connection) {
    connection
        .execute(
            "insert into repo_info (name, path) values (?1, ?2)",
            &[&repo.name, &repo.path],
        )
        .unwrap();
}

pub fn select_repo(connection: &Connection) -> Vec<RepoInfo> {
    let mut repo_list: Vec<RepoInfo> = Vec::new();
    let mut stmt = connection
        .prepare("select * from repo_info")
        .unwrap();
    let repo_iter = stmt
        .query_map([], |repo: &rusqlite::Row<'_>| {
            Ok(RepoInfo {
                id: repo.get(0)?,
                name: repo.get(1)?,
                path: repo.get(2)?,
            })
        })
        .expect("failed to query repo_info");
    for repo in repo_iter {
        repo_list.push(repo.unwrap());
    }
    repo_list
}

#[command]
pub fn scan_repo(path: &str) -> Vec<RepoInfo> {
    if path.is_empty() {
        return Vec::new();
    }
    let connection: Connection = generate_db_connection(path).expect("failed to generate db connection");
    // scan the sub dir of the path
    let mut repo_list: Vec<RepoInfo> = Vec::new();
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
                                        let repo_info = RepoInfo {
                                            id: (&repo_list).len() as i32,
                                            name: file_name.to_str().unwrap().to_string(),
                                            path: sub_path.to_str().unwrap().to_string(),
                                        };
                                        insert_repo(&repo_info, &connection);
                                        repo_info
                                    },
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
        let _ = init_database(path).expect("failed to init database");
        repo_list = scan_repo(path);
    } else {
        let connection = generate_db_connection(path).expect("failed to generate db connection");
        repo_list = select_repo(&connection);
    }

    repo_list
}
