#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PORT=8090

echo "Checking port $PORT..."
PID=$(lsof -ti :"$PORT" 2>/dev/null || true)
if [ -n "$PID" ]; then
    echo "Killing existing process on port $PORT (PID: $PID)"
    kill -9 "$PID" 2>/dev/null || true
    sleep 1
fi

source venv/bin/activate

echo "Starting OFTA backend on http://localhost:$PORT"
PORT=$PORT uvicorn main:app --host 0.0.0.0 --port "$PORT" --reload
