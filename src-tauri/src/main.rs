// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(debug_assertions)]
use tauri::Manager;
use crate::utils::set_window_shadow;
use crate::service::config::init_app_dir;
use crate::service::history_workspace::{init_history_file, read_history_file, write_history_file};

mod utils;
mod service;

fn main() {
    init_app_dir();
    init_history_file();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_history_file,
            write_history_file
        ])
        .setup(|app| {
            set_window_shadow(app);
            #[cfg(debug_assertions)]
            app.get_window("main").unwrap().open_devtools();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}