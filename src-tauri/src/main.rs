// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(debug_assertions)]
use tauri::Manager;

use crate::service::config::init_app_dir;
use crate::service::history_workspace::{init_history_file, read_history_file, write_history_file};
use crate::service::repo_manage::{get_readme, load_repo_list, scan_repo};
use crate::utils::set_window_shadow;

mod database;
mod service;
mod utils;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            read_history_file,
            write_history_file,
            scan_repo,
            load_repo_list,
            get_readme
        ])
        .setup(|app| {
            set_window_shadow(app);
            #[cfg(debug_assertions)]
            app.get_webview_window("main").unwrap().open_devtools();

            init_app_dir(app);
            init_history_file(app);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
