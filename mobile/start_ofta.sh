#!/bin/bash
# ============================================================
# OFTA Mobile App - Dev Server Start Script
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PORT=3100

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo -e "║  ${BLUE}OFTA - Dev Server${NC}                                       ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Kill any existing process on port
echo -e "${BLUE}Checking port ${PORT}...${NC}"
PID=$(lsof -ti :${PORT} 2>/dev/null || true)
if [ -n "$PID" ]; then
    echo -e "${YELLOW}Killing existing process on port ${PORT} (PID: ${PID})${NC}"
    kill -9 $PID 2>/dev/null || true
    sleep 1
fi

# Clean caches
echo -e "${BLUE}Cleaning caches...${NC}"
rm -rf .next node_modules/.cache

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install

# Start dev server
echo ""
echo -e "${GREEN}Starting dev server on http://localhost:${PORT}${NC}"
echo ""
npm run dev
