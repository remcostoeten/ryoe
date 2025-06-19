#!/bin/bash

# Ports Tauri commonly uses; update if different
PORTS=(1420 1421)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

kill_port() {
  local port=$1
  # Find process using the port
  pid=$(lsof -ti tcp:"$port")
  if [[ -n "$pid" ]]; then
    echo -e "${YELLOW}Port $port is in use by PID $pid. Killing process...${NC}"
    kill -9 $pid && echo -e "${GREEN}Process $pid killed.${NC}" || echo -e "${RED}Failed to kill process $pid.${NC}"
    return 0
  else
    echo -e "${GREEN}Port $port is free.${NC}"
    return 1
  fi
}

echo -e "${YELLOW}Checking ports used by Tauri...${NC}"
killed_any=0
for port in "${PORTS[@]}"; do
  kill_port $port && killed_any=1
done

if [[ $killed_any -eq 1 ]]; then
  echo -e "${GREEN}Ports cleaned. Starting app...${NC}"
else
  echo -e "${GREEN}No ports needed cleaning. Starting app...${NC}"
fi

bun tauri dev

