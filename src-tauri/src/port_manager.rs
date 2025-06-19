use serde::{ Deserialize, Serialize };
use std::process::Command;
use tauri::command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortInfo {
    pub port: u16,
    pub pid: Option<u32>,
    pub process_name: Option<String>,
    pub protocol: String,
    pub state: String,
    pub local_address: String,
    pub foreign_address: Option<String>,
    pub is_development: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortScanResult {
    pub ports: Vec<PortInfo>,
    pub total_count: usize,
    pub development_count: usize,
}

// Common development ports
const DEV_PORTS: &[u16] = &[
    3000,
    3001,
    3002,
    3003,
    3004,
    3005, // React, Next.js
    4000,
    4001,
    4002,
    4003,
    4004,
    4005, // Express, Node.js
    5000,
    5001,
    5002,
    5003,
    5004,
    5005, // Flask, Python
    5173,
    5174,
    5175,
    5176,
    5177,
    5178, // Vite
    8000,
    8001,
    8002,
    8003,
    8004,
    8005, // Django, Python
    8080,
    8081,
    8082,
    8083,
    8084,
    8085, // Tomcat, Java
    9000,
    9001,
    9002,
    9003,
    9004,
    9005, // Various
    1420,
    1421,
    1422,
    1423,
    1424,
    1425, // Tauri
    6006,
    6007,
    6008,
    6009,
    6010,
    6011, // Storybook
    7000,
    7001,
    7002,
    7003,
    7004,
    7005, // Various
];

fn is_development_port(port: u16) -> bool {
    DEV_PORTS.contains(&port) || (port >= 3000 && port <= 9999)
}

#[command]
pub async fn scan_ports() -> Result<PortScanResult, String> {
    let ports = get_listening_ports().await?;
    let development_count = ports
        .iter()
        .filter(|p| p.is_development)
        .count();

    Ok(PortScanResult {
        total_count: ports.len(),
        development_count,
        ports,
    })
}

#[command]
pub async fn kill_port(port: u16) -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        let output = Command::new("lsof")
            .args(&["-ti", &format!("tcp:{}", port)])
            .output()
            .map_err(|e| format!("Failed to find process on port {}: {}", port, e))?;

        if output.stdout.is_empty() {
            return Ok(false); // No process found
        }

        let pid_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
        let pid: u32 = pid_str.parse().map_err(|e| format!("Failed to parse PID: {}", e))?;

        let kill_output = Command::new("kill")
            .args(&["-9", &pid.to_string()])
            .output()
            .map_err(|e| format!("Failed to kill process {}: {}", pid, e))?;

        Ok(kill_output.status.success())
    }

    #[cfg(target_os = "windows")]
    {
        let output = Command::new("netstat")
            .args(&["-ano"])
            .output()
            .map_err(|e| format!("Failed to run netstat: {}", e))?;

        let netstat_output = String::from_utf8_lossy(&output.stdout);

        for line in netstat_output.lines() {
            if line.contains(&format!(":{}", port)) && line.contains("LISTENING") {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if let Some(pid_str) = parts.last() {
                    if let Ok(pid) = pid_str.parse::<u32>() {
                        let kill_output = Command::new("taskkill")
                            .args(&["/F", "/PID", &pid.to_string()])
                            .output()
                            .map_err(|e| format!("Failed to kill process {}: {}", pid, e))?;

                        return Ok(kill_output.status.success());
                    }
                }
            }
        }
        Ok(false)
    }

    #[cfg(target_os = "linux")]
    {
        let output = Command::new("lsof")
            .args(&["-ti", &format!("tcp:{}", port)])
            .output()
            .map_err(|e| format!("Failed to find process on port {}: {}", port, e))?;

        if output.stdout.is_empty() {
            return Ok(false);
        }

        let pid_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
        let pid: u32 = pid_str.parse().map_err(|e| format!("Failed to parse PID: {}", e))?;

        let kill_output = Command::new("kill")
            .args(&["-9", &pid.to_string()])
            .output()
            .map_err(|e| format!("Failed to kill process {}: {}", pid, e))?;

        Ok(kill_output.status.success())
    }
}

async fn get_listening_ports() -> Result<Vec<PortInfo>, String> {
    #[cfg(target_os = "macos")]
    {
        get_ports_macos().await
    }

    #[cfg(target_os = "windows")]
    {
        get_ports_windows().await
    }

    #[cfg(target_os = "linux")]
    {
        get_ports_linux().await
    }
}

#[cfg(target_os = "macos")]
async fn get_ports_macos() -> Result<Vec<PortInfo>, String> {
    let output = Command::new("lsof")
        .args(&["-i", "-P", "-n"])
        .output()
        .map_err(|e| format!("Failed to run lsof: {}", e))?;

    let lsof_output = String::from_utf8_lossy(&output.stdout);
    let mut ports = Vec::new();

    for line in lsof_output.lines().skip(1) {
        if line.contains("LISTEN") {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 9 {
                let process_name = parts[0].to_string();
                let pid_str = parts[1];
                let address = parts[8];

                if let Ok(pid) = pid_str.parse::<u32>() {
                    if let Some(port_str) = address.split(':').last() {
                        if let Ok(port) = port_str.parse::<u16>() {
                            let port_info = PortInfo {
                                port,
                                pid: Some(pid),
                                process_name: Some(process_name),
                                protocol: "TCP".to_string(),
                                state: "LISTEN".to_string(),
                                local_address: address.to_string(),
                                foreign_address: None,
                                is_development: is_development_port(port),
                            };
                            ports.push(port_info);
                        }
                    }
                }
            }
        }
    }
    ports.sort_by_key(|p| p.port);
    Ok(ports)
}

#[cfg(target_os = "windows")]
async fn get_ports_windows() -> Result<Vec<PortInfo>, String> {
    let output = Command::new("netstat")
        .args(&["-ano"])
        .output()
        .map_err(|e| format!("Failed to run netstat: {}", e))?;

    let netstat_output = String::from_utf8_lossy(&output.stdout);
    let mut ports = Vec::new();

    for line in netstat_output.lines().skip(4) {
        if line.contains("LISTENING") {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 5 {
                let local_address = parts[1];
                let pid_str = parts[4];

                if let Ok(pid) = pid_str.parse::<u32>() {
                    if let Some(port_str) = local_address.split(':').last() {
                        if let Ok(port) = port_str.parse::<u16>() {
                            let port_info = PortInfo {
                                port,
                                pid: Some(pid),
                                process_name: get_process_name_windows(pid),
                                protocol: parts[0].to_string(),
                                state: "LISTENING".to_string(),
                                local_address: local_address.to_string(),
                                foreign_address: None,
                                is_development: is_development_port(port),
                            };
                            ports.push(port_info);
                        }
                    }
                }
            }
        }
    }

    ports.sort_by_key(|p| p.port);
    Ok(ports)
}

#[cfg(target_os = "linux")]
async fn get_ports_linux() -> Result<Vec<PortInfo>, String> {
    let output = Command::new("ss")
        .args(&["-tlnp"])
        .output()
        .map_err(|e| format!("Failed to run ss: {}", e))?;

    let ss_output = String::from_utf8_lossy(&output.stdout);
    let mut ports = Vec::new();

    for line in ss_output.lines().skip(1) {
        if line.contains("LISTEN") {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 4 {
                let local_address = parts[3];

                if let Some(port_str) = local_address.split(':').last() {
                    if let Ok(port) = port_str.parse::<u16>() {
                        let mut process_name = None;
                        let mut pid = None;

                        // Try to extract process info from the last column
                        if parts.len() >= 6 {
                            let process_info = parts[5];
                            if process_info.contains("pid=") {
                                let pid_start = process_info.find("pid=").unwrap() + 4;
                                let pid_end = process_info[pid_start..]
                                    .find(',')
                                    .unwrap_or(process_info.len() - pid_start);
                                if
                                    let Ok(p) =
                                        process_info[pid_start..pid_start + pid_end].parse::<u32>()
                                {
                                    pid = Some(p);
                                }
                            }
                            if let Some(name_start) = process_info.find("\"") {
                                if let Some(name_end) = process_info[name_start + 1..].find("\"") {
                                    process_name = Some(
                                        process_info[
                                            name_start + 1..name_start + 1 + name_end
                                        ].to_string()
                                    );
                                }
                            }
                        }

                        let port_info = PortInfo {
                            port,
                            pid,
                            process_name,
                            protocol: "TCP".to_string(),
                            state: "LISTEN".to_string(),
                            local_address: local_address.to_string(),
                            foreign_address: None,
                            is_development: is_development_port(port),
                        };
                        ports.push(port_info);
                    }
                }
            }
        }
    }

    ports.sort_by_key(|p| p.port);
    Ok(ports)
}

#[cfg(target_os = "windows")]
fn get_process_name_windows(pid: u32) -> Option<String> {
    let output = Command::new("tasklist")
        .args(&["/FI", &format!("PID eq {}", pid), "/FO", "CSV", "/NH"])
        .output()
        .ok()?;

    let output_str = String::from_utf8_lossy(&output.stdout);
    let parts: Vec<&str> = output_str.split(',').collect();
    if !parts.is_empty() {
        Some(parts[0].trim_matches('"').to_string())
    } else {
        None
    }
}
