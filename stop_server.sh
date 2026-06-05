#!/bin/bash

# One for the Ages - Stop All Services

echo "Stopping One for the Ages..."

for PID_FILE in /tmp/ofta_backend.pid /tmp/ofta_frontend.pid; do
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        kill "$PID" 2>/dev/null && echo "Stopped PID $PID"
        rm "$PID_FILE"
    fi
done

# Force-clear the ports
lsof -ti:8090 | xargs kill -9 2>/dev/null || true
lsof -ti:3100 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

echo "Done"
