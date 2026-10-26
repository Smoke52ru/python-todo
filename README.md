# PythonTodo

Full-stack todo app: FastAPI backend + React (Vite) frontend with RTK Query.

## Layout

```
backend/    FastAPI + SQLite
frontend/   React + TypeScript + Vite
```

## Backend

```bash
cd backend
uv sync
uv run uvicorn backend.main:app --reload --port 8000
```

API docs: http://127.0.0.1:8000/docs

## Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://127.0.0.1:5173 (Vite proxies `/todo/*` to the API).
