use rusqlite::{Connection, Result};
use serde::Serialize;

#[derive(Serialize, Debug)]
pub struct RepoInfo {
    pub id: i32,
    pub name: String,
    pub path: String,
}

pub fn create_repo_tb(connection: &Connection) -> Result<()> {
    connection.execute(
        "create table if not exists repo_info (
            id integer primary key autoincrement,
            name text not null,
            path text not null
        )",
        [],
    )?;
    Ok(())
}

pub fn insert_repo(repo: &RepoInfo, connection: &Connection) -> Result<()> {
    connection.execute(
        "insert into repo_info (name, path) values (?1, ?2)",
        &[&repo.name, &repo.path],
    )?;
    Ok(())
}

pub fn select_repo(connection: &Connection) -> Result<Vec<RepoInfo>> {
    let mut repo_list: Vec<RepoInfo> = Vec::new();
    let mut stmt = connection
        .prepare("select * from repo_info")
        .expect("error occurred when selecting repo");
    let repo_iter = stmt.query_map([], |repo: &rusqlite::Row<'_>| {
        Ok(RepoInfo {
            id: repo.get(0)?,
            name: repo.get(1)?,
            path: repo.get(2)?,
        })
    })?;
    for repo in repo_iter {
        repo_list.push(repo?);
    }
    Ok(repo_list)
}
