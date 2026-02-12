#!/bin/bash

# One for the Ages - Stop All Services

echo "🛑 Stopping One for the Ages services..."

# Read PIDs from files
if [ -f /tmp/ofta_backend.pid ]; then
    BACKEND_PID=$(cat /tmp/ofta_backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
    fi
    rm /tmp/ofta_backend.pid
fi

if [ -f /tmp/ofta_mobile.pid ]; then
    MOBILE_PID=$(cat /tmp/ofta_mobile.pid)
    if kill -0 $MOBILE_PID 2>/dev/null; then
        echo "Stopping mobile (PID: $MOBILE_PID)..."
        kill $MOBILE_PID
    fi
    rm /tmp/ofta_mobile.pid
fi

# Also kill any uvicorn or next processes on the ports
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo "✅ All services stopped"
