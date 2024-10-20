use std::path::Path;

use rusqlite::{Connection, Result};
use tauri::command;

#[command]
pub fn init_workspace(path: &str) -> Result<(), String> {
    let path = Path::new(path);
    let config_path = path.join(".repo");
    if !config_path.exists() {
        std::fs::create_dir_all(config_path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// TODO check if the workspace configuration file is existed
#[command]
pub fn is_new_workspace(path: &str) -> bool {
    let path = Path::new(path);
    let config_path = path.join(".repo").join("db");
    !config_path.exists()
}

#[command]
pub fn init_database(path: &str) -> Result<Connection> {
    let path = Path::new(path);
    let db_path = path.join(".repo").join("db");
    if !db_path.exists() {
        std::fs::create_dir_all(&db_path).unwrap();
    }
    let connection = Connection::open(db_path.join("repo.db")).unwrap();
    // create table of repo
    let _ = connection.execute(
        "create table if not exists repo_info (
            id integer primary key autoincrement,
            name text not null,
            path text not null
        )",
        [],
    )?;
    Ok(connection)
}

pub fn generate_db_connection(path: &str) -> Result<Connection> {
    let path = Path::new(path);
    let db_path = path.join(".repo").join("db").join("repo.db");
    let connection = Connection::open(db_path)?;
    Ok(connection)
}
