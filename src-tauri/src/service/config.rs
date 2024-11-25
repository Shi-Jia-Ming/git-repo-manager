use tauri::{command, App, Manager};

#[command]
pub fn init_app_dir(app: &mut App) {
    let app_dir = app
        .path()
        .resolve("", tauri::path::BaseDirectory::AppData)
        .unwrap();
    if !app_dir.exists() {
        std::fs::create_dir_all(app_dir).unwrap();
    }
}
