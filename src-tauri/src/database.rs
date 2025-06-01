use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseHealth {
    pub status: String,
    pub message: String,
    pub last_checked: String,
    pub response_time: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QueryResult {
    pub status: String,
    pub message: String,
    pub result: Option<String>,
    pub response_time: u64,
    pub last_executed: String,
}

pub struct DatabaseManager {
    pub connection: Mutex<Option<Connection>>,
}

impl DatabaseManager {
    pub fn new() -> Self {
        Self {
            connection: Mutex::new(None),
        }
    }

    pub fn initialize(&self, app_handle: &AppHandle) -> Result<(), String> {
        let app_data_dir = app_handle
            .path()
            .app_data_dir()
            .map_err(|e| format!("Failed to get app data directory: {}", e))?;

        // Create the directory if it doesn't exist
        std::fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Failed to create app data directory: {}", e))?;

        let db_path = app_data_dir.join("notes.db");

        let conn = Connection::open(&db_path)
            .map_err(|e| format!("Failed to open database: {}", e))?;

        // Create tables if they don't exist
        self.create_tables(&conn)?;

        let mut connection_guard = self.connection.lock().unwrap();
        *connection_guard = Some(conn);

        Ok(())
    }

    fn create_tables(&self, conn: &Connection) -> Result<(), String> {
        // Create users table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                snippets_path TEXT NOT NULL,
                created_at INTEGER NOT NULL
            )",
            [],
        )
        .map_err(|e| format!("Failed to create users table: {}", e))?;

        // Create snippets table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS snippets (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                file_path TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )",
            [],
        )
        .map_err(|e| format!("Failed to create snippets table: {}", e))?;

        Ok(())
    }

    pub fn check_health(&self) -> DatabaseHealth {
        let start_time = std::time::Instant::now();
        let connection_guard = self.connection.lock().unwrap();

        match &*connection_guard {
            None => DatabaseHealth {
                status: "disconnected".to_string(),
                message: "Database not initialized".to_string(),
                last_checked: chrono::Utc::now().to_rfc3339(),
                response_time: None,
            },
            Some(conn) => {
                // Use a simple query that doesn't return results
                match conn.execute("CREATE TABLE IF NOT EXISTS health_check_temp (id INTEGER)", []) {
                    Ok(_) => {
                        // Clean up the temp table
                        let _ = conn.execute("DROP TABLE IF EXISTS health_check_temp", []);

                        let response_time = start_time.elapsed().as_millis() as u64;
                        DatabaseHealth {
                            status: "healthy".to_string(),
                            message: format!("Database is healthy ({}ms)", response_time),
                            last_checked: chrono::Utc::now().to_rfc3339(),
                            response_time: Some(response_time),
                        }
                    }
                    Err(e) => {
                        let response_time = start_time.elapsed().as_millis() as u64;
                        DatabaseHealth {
                            status: "error".to_string(),
                            message: format!("Database error: {}", e),
                            last_checked: chrono::Utc::now().to_rfc3339(),
                            response_time: Some(response_time),
                        }
                    }
                }
            }
        }
    }

    pub fn execute_query(&self, query: &str) -> QueryResult {
        let start_time = std::time::Instant::now();
        let connection_guard = self.connection.lock().unwrap();

        match &*connection_guard {
            None => QueryResult {
                status: "error".to_string(),
                message: "Database not initialized".to_string(),
                result: None,
                response_time: start_time.elapsed().as_millis() as u64,
                last_executed: chrono::Utc::now().to_rfc3339(),
            },
            Some(conn) => {
                let query = query.trim();

                // For simplicity, let's handle all queries as execute() and provide basic feedback
                match conn.execute(query, []) {
                    Ok(rows_affected) => {
                        let response_time = start_time.elapsed().as_millis() as u64;

                        // Provide different messages based on query type
                        let (message, result) = if query.to_uppercase().trim().starts_with("SELECT") {
                            // For SELECT queries, we can't show results with execute(), but we can confirm it ran
                            (
                                format!("SELECT query executed successfully ({}ms)", response_time),
                                Some("Query executed successfully. Note: Use a proper SELECT handler to see results.".to_string())
                            )
                        } else {
                            (
                                format!("Query executed successfully ({}ms)", response_time),
                                Some(format!("Rows affected: {}", rows_affected))
                            )
                        };

                        QueryResult {
                            status: "success".to_string(),
                            message,
                            result,
                            response_time,
                            last_executed: chrono::Utc::now().to_rfc3339(),
                        }
                    }
                    Err(e) => {
                        let response_time = start_time.elapsed().as_millis() as u64;
                        QueryResult {
                            status: "error".to_string(),
                            message: format!("Query execution error: {}", e),
                            result: Some(format!("Error details: {}", e)),
                            response_time,
                            last_executed: chrono::Utc::now().to_rfc3339(),
                        }
                    }
                }
            }
        }
    }
}
