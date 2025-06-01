#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_usage() {
  echo -e "${CYAN}Usage:${NC} $0 clipboard"
  echo -e "       $0 file <filename>\n"
}

if [[ $# -lt 1 ]]; then
  print_usage
  exit 1
fi

MODE=$1
FILE=$2

echo -e "${CYAN}Running pnpm build...${NC}\n"

if [[ "$MODE" == "clipboard" ]]; then
  # Check if xclip is installed
  if ! command -v xclip &> /dev/null; then
    echo -e "${RED}Error:${NC} xclip not found! Install it with 'sudo apt install xclip'"
    exit 1
  fi

  pnpm build 2>&1 | tee /dev/tty | xclip -selection clipboard

  if [[ ${PIPESTATUS[0]} -eq 0 ]]; then
    echo -e "\n${GREEN}Build completed successfully.${NC}"
    echo -e "${YELLOW}Output copied to clipboard.${NC}"
  else
    echo -e "\n${RED}Build failed.${NC}"
    exit 1
  fi

elif [[ "$MODE" == "file" ]]; then
  if [[ -z "$FILE" ]]; then
    echo -e "${RED}Error:${NC} Please specify the output filename."
    print_usage
    exit 1
  fi

  pnpm build 2>&1 | tee "$FILE"

  if [[ ${PIPESTATUS[0]} -eq 0 ]]; then
    echo -e "\n${GREEN}Build completed successfully.${NC}"
    echo -e "${YELLOW}Output saved to file: ${FILE}${NC}"
  else
    echo -e "\n${RED}Build failed.${NC}"
    exit 1
  fi

else
  print_usage
  exit 1
fi
