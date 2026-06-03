# OFTA Dev Servers

Two servers must run simultaneously for local development.

## Backend (FastAPI) — port 8090

```bash
cd backend
bash start.sh
```

Or manually:

```bash
cd backend
source venv/bin/activate
PORT=8090 python main.py
```

## Frontend (Next.js) — port 3100

```bash
cd mobile
bash start.sh
```

Or manually:

```bash
cd mobile
npm run dev
```

## Open

http://localhost:3100

The frontend talks to the backend via `NEXT_PUBLIC_API_URL` in `mobile/.env.local` (set to `http://localhost:8090`).
