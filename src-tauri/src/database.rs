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
                let upper_query = query.to_uppercase();

                if upper_query.starts_with("SELECT") {
                    // Handle SELECT queries
                    match conn.prepare(query) {
                        Ok(mut stmt) => {
                            // Get column names before executing the query
                            let column_names: Vec<String> = stmt
                                .column_names()
                                .into_iter()
                                .map(|s| s.to_string())
                                .collect();
                            
                            match stmt.query([]) {
                                Ok(mut rows) => {
                                    let mut result = String::new();
                                    
                                    // Add column headers
                                    if !column_names.is_empty() {
                                        result.push_str(&column_names.join(" | "));
                                        result.push_str("\n");
                                        result.push_str(&"-".repeat(column_names.join(" | ").len()));
                                        result.push_str("\n");
                                    }

                                    // Process rows
                                    let mut row_count = 0;
                                    while let Ok(Some(row)) = rows.next() {
                                        let mut row_values = Vec::new();
                                        for i in 0..column_names.len() {
                                            let value: String = match row.get(i) {
                                                Ok(val) => val,
                                                Err(_) => "NULL".to_string(),
                                            };
                                            row_values.push(value);
                                        }
                                        result.push_str(&row_values.join(" | "));
                                        result.push_str("\n");
                                        row_count += 1;
                                    }

                                    let response_time = start_time.elapsed().as_millis() as u64;
                                    QueryResult {
                                        status: "success".to_string(),
                                        message: format!("Query returned {} rows ({}ms)", row_count, response_time),
                                        result: Some(result),
                                        response_time,
                                        last_executed: chrono::Utc::now().to_rfc3339(),
                                    }
                                }
                                Err(e) => {
                                    let response_time = start_time.elapsed().as_millis() as u64;
                                    QueryResult {
                                        status: "error".to_string(),
                                        message: format!("Error executing query: {}", e),
                                        result: Some(format!("Error details: {}", e)),
                                        response_time,
                                        last_executed: chrono::Utc::now().to_rfc3339(),
                                    }
                                }
                            }
                        }
                        Err(e) => {
                            let response_time = start_time.elapsed().as_millis() as u64;
                            QueryResult {
                                status: "error".to_string(),
                                message: format!("Error preparing query: {}", e),
                                result: Some(format!("Error details: {}", e)),
                                response_time,
                                last_executed: chrono::Utc::now().to_rfc3339(),
                            }
                        }
                    }
                } else {
                    // Handle non-SELECT queries (INSERT, UPDATE, DELETE, CREATE, etc.)
                    match conn.execute(query, []) {
                        Ok(rows_affected) => {
                            let response_time = start_time.elapsed().as_millis() as u64;
                            QueryResult {
                                status: "success".to_string(),
                                message: format!("Query executed successfully ({}ms)", response_time),
                                result: Some(format!("Rows affected: {}", rows_affected)),
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

    pub fn create_user(&self, name: &str, snippets_path: &str) -> Result<i64, String> {
        let connection_guard = self.connection.lock().unwrap();
        
        match &*connection_guard {
            None => Err("Database not initialized".to_string()),
            Some(conn) => {
                let now = chrono::Utc::now().timestamp();
                
                match conn.execute(
                    "INSERT INTO users (name, snippets_path, created_at) VALUES (?, ?, ?)",
                    [name, snippets_path, &now.to_string()],
                ) {
                    Ok(_) => {
                        // Get the last inserted row id
                        match conn.last_insert_rowid() {
                            id => Ok(id),
                        }
                    },
                    Err(e) => Err(format!("Failed to create user: {}", e)),
                }
            }
        }
    }
}
