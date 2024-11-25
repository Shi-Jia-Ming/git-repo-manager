use tauri::{command, App, AppHandle, Manager};

#[command]
pub fn init_history_file(app: &mut App) {
    let data_path = app
        .path()
        .resolve("", tauri::path::BaseDirectory::AppData)
        .unwrap();
    let data_file = data_path.join("history.json");
    if !data_file.exists() {
        std::fs::write(data_file, "[]").unwrap();
    }
}

#[command]
pub fn read_history_file(handle: AppHandle) -> String {
    let data_path = handle
        .path()
        .resolve("", tauri::path::BaseDirectory::AppData)
        .unwrap();
    let data_file = data_path.join("history.json");
    std::fs::read_to_string(data_file).unwrap()
}

#[command]
pub fn write_history_file(data: String, handle: AppHandle) {
    let data_path = handle
        .path()
        .resolve("", tauri::path::BaseDirectory::AppData)
        .unwrap();
    let data_file = data_path.join("history.json");
    std::fs::write(data_file, data).unwrap();
}
