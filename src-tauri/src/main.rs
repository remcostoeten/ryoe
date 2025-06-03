// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;

use database::{DatabaseManager, DatabaseHealth, QueryResult};
use std::sync::Arc;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_window_state;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn initialize_database(
    app_handle: AppHandle,
    db_manager: State<'_, Arc<DatabaseManager>>,
) -> Result<String, String> {
    db_manager.initialize(&app_handle)?;
    Ok("Database initialized successfully".to_string())
}

#[tauri::command]
async fn check_database_health(
    db_manager: State<'_, Arc<DatabaseManager>>,
) -> Result<DatabaseHealth, String> {
    Ok(db_manager.check_health())
}

#[tauri::command]
async fn execute_database_query(
    query: String,
    db_manager: State<'_, Arc<DatabaseManager>>,
) -> Result<QueryResult, String> {
    Ok(db_manager.execute_query(&query))
}

#[tauri::command]
async fn create_user(
    name: String,
    snippets_path: String,
    db_manager: State<'_, Arc<DatabaseManager>>,
) -> Result<i64, String> {
    db_manager.create_user(&name, &snippets_path)
}

fn main() {
    let db_manager = Arc::new(DatabaseManager::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .manage(db_manager)
        .invoke_handler(tauri::generate_handler![
            greet,
            initialize_database,
            check_database_health,
            execute_database_query,
            create_user
        ])
        .setup(|app| {
            let db_manager = app.state::<Arc<DatabaseManager>>();
            if let Err(e) = db_manager.initialize(app.handle()) {
                eprintln!("Failed to initialize database: {}", e);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
