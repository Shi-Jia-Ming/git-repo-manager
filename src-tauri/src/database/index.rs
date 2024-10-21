use rusqlite::{Connection, Result};
use std::path::Path;

use super::module::repo_info::create_repo_tb;

pub fn init_database(repo_path: &str) -> Result<Connection> {
    let connection: Connection = get_db_connection(repo_path)?;
    // create table of repo
    create_repo_tb(&connection)?;
    Ok(connection)
}

pub fn get_db_connection(repo_path: &str) -> Result<Connection> {
    let path = Path::new(repo_path);
    let db_path = path.join(".repo").join("db");
    if !db_path.exists() {
        std::fs::create_dir_all(&db_path).expect("failed to create db directory");
    }
    let db_path = db_path.join("repo.db");
    let connection = Connection::open(db_path)?;
    Ok(connection)
}
