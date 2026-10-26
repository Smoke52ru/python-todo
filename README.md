# PythonTodo

Full-stack todo app: FastAPI + SQLModel backend and React (Vite) + RTK Query frontend.

## Layout

```
backend/     FastAPI, SQLModel, SQLite, Alembic
frontend/    React + TypeScript + Vite + RTK Query
```

## Quick start

```bash
make install

# terminal 1
make backend

# terminal 2
make frontend
```

- UI: http://127.0.0.1:5173  
- API docs: http://127.0.0.1:8000/docs  

## Scripts

| Command | Description |
|---------|-------------|
| `make test` | Backend pytest + frontend Vitest |
| `make lint` | Ruff + ESLint |
| `make format` | Ruff format + Prettier |
| `make e2e` | Playwright against live stack |
| `make codegen` | Regenerate OpenAPI types (backend must be running) |

## Frontend env

Copy `frontend/.env.example`. Leave `VITE_API_URL` empty to use Vite’s proxy to `:8000`.

## Pre-commit

```bash
pip install pre-commit   # or: uv tool install pre-commit
pre-commit install
```

Hooks run Ruff on `backend/` and ESLint/Prettier on `frontend/`.
