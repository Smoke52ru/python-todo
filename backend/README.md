# PythonTodo Backend

FastAPI + SQLModel + SQLite todo API.

## Setup

```bash
uv sync --group dev
```

## Run

```bash
uv run fastapi dev src/backend/main.py --port 8000
```

- Docs: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/health

## Migrations

```bash
PYTHONPATH=src uv run alembic upgrade head
```

On first start, `lifespan` also calls `SQLModel.metadata.create_all` and sets up FTS5.

## Tests & lint

```bash
uv run pytest
uv run ruff check src tests
uv run ruff format src tests
```

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///<backend>/todo.db` | SQLAlchemy URL |
| `CORS_ORIGINS` | `http://localhost:5173`, `http://127.0.0.1:5173` | Allowed CORS origins (JSON list) |
| `LOG_LEVEL` | `INFO` | Logging level |

## API

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/todos` | List (`q`, `done`, `limit`, `offset`, `sort`, `order`) |
| `GET` | `/todos/{id}` | One item |
| `POST` | `/todos` | `{ "body": "..." }` → 201 |
| `PATCH` | `/todos/{id}` | Partial `{ "body"?, "done"? }` |
| `DELETE` | `/todos/{id}` | 204 |
| `PATCH` | `/todos` | Bulk `{ "done": true }` |
| `DELETE` | `/todos?done=true` | Delete by status |
| `GET` | `/health` | Liveness |
