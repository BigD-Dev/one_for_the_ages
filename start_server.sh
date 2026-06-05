#!/bin/bash

# One for the Ages - Start All Services

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
MOBILE_DIR="$SCRIPT_DIR/mobile"

BACKEND_PORT=8090
FRONTEND_PORT=3100

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Starting One for the Ages..."
echo ""

# Stop anything already on those ports
lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true  # kill old port if still open

# Check deps
if [ ! -d "$BACKEND_DIR/venv" ]; then
    echo -e "${YELLOW}Backend venv not found — creating...${NC}"
    cd "$BACKEND_DIR" && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && deactivate
fi

if [ ! -d "$MOBILE_DIR/node_modules" ]; then
    echo -e "${YELLOW}Frontend node_modules not found — installing...${NC}"
    cd "$MOBILE_DIR" && npm install
fi

# Start backend
echo -e "${GREEN}Starting backend on port $BACKEND_PORT...${NC}"
cd "$BACKEND_DIR"
source venv/bin/activate
ENVIRONMENT=development uvicorn main:app --host 0.0.0.0 --port $BACKEND_PORT --reload > /tmp/ofta_backend.log 2>&1 &
BACKEND_PID=$!
deactivate
cd "$SCRIPT_DIR"

sleep 3

# Start frontend
echo -e "${GREEN}Starting frontend on port $FRONTEND_PORT...${NC}"
cd "$MOBILE_DIR"
npm run dev -- --port $FRONTEND_PORT > /tmp/ofta_frontend.log 2>&1 &
FRONTEND_PID=$!
cd "$SCRIPT_DIR"

sleep 5

echo ""
echo -e "${GREEN}One for the Ages is running${NC}"
echo ""
echo "  Frontend:  http://localhost:$FRONTEND_PORT"
echo "  Backend:   http://localhost:$BACKEND_PORT"
echo "  API Docs:  http://localhost:$BACKEND_PORT/docs"
echo ""
echo "  Logs:"
echo "    tail -f /tmp/ofta_backend.log"
echo "    tail -f /tmp/ofta_frontend.log"
echo ""

echo "$BACKEND_PID" > /tmp/ofta_backend.pid
echo "$FRONTEND_PID" > /tmp/ofta_frontend.pid

tail -f /tmp/ofta_backend.log /tmp/ofta_frontend.log
