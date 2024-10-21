// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(debug_assertions)]
use tauri::Manager;

use crate::service::repo_manage::{scan_repo, load_repo_list, get_readme};
use crate::service::workspace::init_workspace;
use crate::service::config::init_app_dir;
use crate::service::history_workspace::{init_history_file, read_history_file, write_history_file};
use crate::utils::set_window_shadow;

mod utils;
mod service;
mod database;

fn main() {
    init_app_dir();
    init_history_file();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_history_file,
            write_history_file,
            init_workspace,
            scan_repo,
            load_repo_list,
            get_readme
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