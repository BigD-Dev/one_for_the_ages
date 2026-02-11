# OFTA Backend (FastAPI)

FastAPI backend for One for the Ages game.

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Run

```bash
uvicorn main:app --reload --port 8080
```

## Docs

- Swagger: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc
