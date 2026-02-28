// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Runtime,
};

#[tauri::command]
fn update_tray_status(app: tauri::AppHandle, active: bool) {
    let tray = app.tray_by_id("main").unwrap();
    if active {
        // In a real app, you would swap icons here
        // tray.set_icon(Some(tauri::Icon::Raw(include_bytes!("../icons/active.png").to_vec()))).unwrap();
        println!("[Desktop] NIRIUM SIGNAL DETECTED — Tray Cyan Glow Active");
    } else {
        // tray.set_icon(Some(tauri::Icon::Raw(include_bytes!("../icons/inactive.png").to_vec()))).unwrap();
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![update_tray_status])
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "Quit Nirium", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i])?;

            let _tray = TrayIconBuilder::with_id("main")
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_tray_icon_event(|tray, event| match event {
                    TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } => {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
