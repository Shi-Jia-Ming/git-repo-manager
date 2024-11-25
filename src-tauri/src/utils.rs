use tauri::{Manager, Runtime};

pub fn set_window_shadow<R: Runtime>(app: &tauri::App<R>) {
    let window = app.get_webview_window("main").unwrap();
    window
        .set_shadow(true)
        .expect("Unsupported platform when shadowing window!");
}
