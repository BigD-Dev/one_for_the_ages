#!/bin/bash

# One for the Ages - Start All Services
# This script starts both backend and mobile app

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
MOBILE_DIR="$SCRIPT_DIR/mobile"

echo "🎮 Starting One for the Ages..."
echo ""

# First, stop any existing instances
"$SCRIPT_DIR/stop_server.sh"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend .env exists
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  Backend .env not found. Creating from .env.example...${NC}"
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
    echo -e "${YELLOW}⚠️  Please edit backend/.env with your database credentials${NC}"
    echo ""
fi

# Check if mobile .env.local exists
if [ ! -f "$MOBILE_DIR/.env.local" ]; then
    echo -e "${YELLOW}⚠️  Mobile .env.local not found. You may need to configure Firebase.${NC}"
    echo ""
fi

# Function to check if backend dependencies are installed
check_backend_deps() {
    if [ ! -d "$BACKEND_DIR/venv" ]; then
        echo -e "${YELLOW}⚠️  Backend virtual environment not found. Creating...${NC}"
        cd "$BACKEND_DIR"
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        deactivate
        cd "$SCRIPT_DIR"
    fi
}

# Function to check if mobile dependencies are installed
check_mobile_deps() {
    if [ ! -d "$MOBILE_DIR/node_modules" ]; then
        echo -e "${YELLOW}⚠️  Mobile dependencies not found. Installing...${NC}"
        cd "$MOBILE_DIR"
        npm install
        cd "$SCRIPT_DIR"
    fi
}

# Check dependencies
echo -e "${BLUE}📦 Checking dependencies...${NC}"
check_backend_deps
check_mobile_deps
echo ""

# Start backend in background
echo -e "${GREEN}🚀 Starting Backend (port 8081)...${NC}"
cd "$BACKEND_DIR"
source venv/bin/activate
uvicorn main:app --reload --port 8081 > /tmp/ofta_backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
deactivate
cd "$SCRIPT_DIR"

# Wait a bit for backend to start
sleep 3

# Start mobile in background
echo -e "${GREEN}📱 Starting Mobile App (port 3100)...${NC}"
cd "$MOBILE_DIR"
npm run dev:clean > /tmp/ofta_mobile.log 2>&1 &
MOBILE_PID=$!
echo "Mobile PID: $MOBILE_PID"
cd "$SCRIPT_DIR"

# Wait a bit for mobile to start
sleep 5

echo ""
echo -e "${GREEN}✅ One for the Ages is running!${NC}"
echo ""
echo "📍 URLs:"
echo "   Backend API: http://localhost:8081"
echo "   API Docs:    http://localhost:8081/docs"
echo "   Mobile App:  http://localhost:3100"
echo ""
echo "📋 Logs:"
echo "   Backend: tail -f /tmp/ofta_backend.log"
echo "   Mobile:  tail -f /tmp/ofta_mobile.log"
echo ""
echo "🛑 To stop all services:"
echo "   kill $BACKEND_PID $MOBILE_PID"
echo "   Or run: ./stop_server.sh"
echo ""

# Save PIDs to file for stop script
echo "$BACKEND_PID" > /tmp/ofta_backend.pid
echo "$MOBILE_PID" > /tmp/ofta_mobile.pid

# Keep script running and show logs
echo -e "${BLUE}📊 Showing live logs (Ctrl+C to exit)...${NC}"
echo ""
tail -f /tmp/ofta_backend.log /tmp/ofta_mobile.log
