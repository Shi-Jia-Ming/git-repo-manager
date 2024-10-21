use std::path::Path;

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
    let config_path = path.join(".repo");
    !config_path.exists()
}
