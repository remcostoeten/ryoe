// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_window_state;
use tauri::{Manager, Emitter, menu::{Menu, MenuItem, Submenu}, tray::TrayIconBuilder};

// Temporarily disabled vibrancy imports
// #[cfg(target_os = "macos")]
// use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial, NSVisualEffectState};

mod port_manager;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn create_tray_menu(app: &tauri::AppHandle) -> tauri::Result<Menu<tauri::Wry>> {
    let port_manager = MenuItem::with_id(app, "port_manager", "Port Manager", true, None::<&str>)?;
    let scan_ports = MenuItem::with_id(app, "scan_ports", "Scan Ports", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[
        &port_manager,
        &scan_ports,
        &quit,
    ])?;

    Ok(menu)
}

fn create_app_menu(app: &tauri::AppHandle) -> tauri::Result<Menu<tauri::Wry>> {
    // File menu
    let new_file = MenuItem::with_id(app, "new_file", "New File", true, Some("CmdOrCtrl+N"))?;
    let open_file = MenuItem::with_id(app, "open_file", "Open File", true, Some("CmdOrCtrl+O"))?;
    let save_file = MenuItem::with_id(app, "save_file", "Save", true, Some("CmdOrCtrl+S"))?;
    let file_menu = Submenu::with_id_and_items(app, "file", "File", true, &[
        &new_file,
        &open_file,
        &save_file,
    ])?;

    // View menu
    let toggle_sidebar = MenuItem::with_id(app, "toggle_sidebar", "Toggle Sidebar", true, Some("CmdOrCtrl+B"))?;
    let toggle_right_sidebar = MenuItem::with_id(app, "toggle_right_sidebar", "Toggle Right Sidebar", true, Some("CmdOrCtrl+Shift+B"))?;
    let port_manager_menu = MenuItem::with_id(app, "port_manager", "Port Manager", true, Some("CmdOrCtrl+P"))?;
    let view_menu = Submenu::with_id_and_items(app, "view", "View", true, &[
        &toggle_sidebar,
        &toggle_right_sidebar,
        &port_manager_menu,
    ])?;

    // Window menu
    let minimize = MenuItem::with_id(app, "minimize", "Minimize", true, Some("CmdOrCtrl+M"))?;
    let close = MenuItem::with_id(app, "close", "Close", true, Some("CmdOrCtrl+W"))?;
    let window_menu = Submenu::with_id_and_items(app, "window", "Window", true, &[
        &minimize,
        &close,
    ])?;

    // Help menu
    let about = MenuItem::with_id(app, "about", "About Ryoe", true, None::<&str>)?;
    let help_menu = Submenu::with_id_and_items(app, "help", "Help", true, &[
        &about,
    ])?;

    let menu = Menu::with_items(app, &[
        &file_menu,
        &view_menu,
        &window_menu,
        &help_menu,
    ])?;

    Ok(menu)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .setup(|app| {
            let _window = app.get_webview_window("main").unwrap();

            // Create application menu
            let app_menu = create_app_menu(&app.handle())?;
            app.set_menu(app_menu)?;

            // Create tray icon
            let tray_menu = create_tray_menu(&app.handle())?;
            let _tray = TrayIconBuilder::with_id("main-tray")
                .menu(&tray_menu)
                .icon(app.default_window_icon().unwrap().clone())
                .build(app)?;

            // Temporarily disable vibrancy effects to debug window issues
            // #[cfg(target_os = "macos")]
            // apply_vibrancy(&_window, NSVisualEffectMaterial::HudWindow, Some(NSVisualEffectState::Active), None)
            //     .expect("Failed to apply vibrancy effect");

            // #[cfg(target_os = "windows")]
            // window_vibrancy::apply_blur(&_window, Some((18, 18, 18, 125)))
            //     .expect("Failed to apply blur effect");

            Ok(())
        })
        .on_menu_event(|app, event| {
            match event.id().as_ref() {
                "quit" => {
                    std::process::exit(0);
                }
                "port_manager" => {
                    // Navigate to port manager page
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                        // Emit event to frontend to navigate to port manager
                        let _ = window.emit("navigate", "/port-manager");
                    }
                }
                "scan_ports" => {
                    // Trigger port scan
                    println!("Scanning ports...");
                }
                "new_file" => {
                    // Create new file
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("menu-action", "new_file");
                    }
                }
                "open_file" => {
                    // Open file dialog
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("menu-action", "open_file");
                    }
                }
                "save_file" => {
                    // Save current file
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("menu-action", "save_file");
                    }
                }
                "toggle_sidebar" => {
                    // Toggle left sidebar
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("menu-action", "toggle_sidebar");
                    }
                }
                "toggle_right_sidebar" => {
                    // Toggle right sidebar
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("menu-action", "toggle_right_sidebar");
                    }
                }
                "minimize" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.minimize();
                    }
                }
                "close" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.close();
                    }
                }
                "about" => {
                    // Show about dialog
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("menu-action", "about");
                    }
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            port_manager::scan_ports,
            port_manager::kill_port
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
