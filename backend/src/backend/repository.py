from datetime import UTC, datetime

from sqlalchemy import ColumnElement, func, text
from sqlmodel import Session, col, select

from backend.models import Todo
from backend.schemas import SortField, SortOrder, TodoCreate, TodoUpdate


def _escape_fts_query(query: str) -> str:
    """Escape FTS5 special characters; wrap tokens for prefix matching."""
    cleaned = "".join(ch if ch.isalnum() or ch.isspace() else " " for ch in query)
    tokens = [token for token in cleaned.split() if token]
    if not tokens:
        return ""
    return " ".join(f'"{token}"*' for token in tokens)


def _sort_column(sort: SortField):
    mapping = {
        "id": Todo.id,
        "created_at": Todo.created_at,
        "updated_at": Todo.updated_at,
        "body": Todo.body,
    }
    return mapping[sort]


def list_todos(
    session: Session,
    *,
    q: str | None = None,
    done: bool | None = None,
    limit: int = 50,
    offset: int = 0,
    sort: SortField = "created_at",
    order: SortOrder = "desc",
) -> tuple[list[Todo], int]:
    filters: list[ColumnElement[bool]] = []

    if done is not None:
        filters.append(col(Todo.done) == done)

    if q:
        fts_query = _escape_fts_query(q)
        if fts_query:
            result = session.connection().execute(
                text("SELECT rowid FROM todos_fts WHERE todos_fts MATCH :query"),
                {"query": fts_query},
            )
            ids = [row[0] for row in result.fetchall()]
            if not ids:
                return [], 0
            filters.append(col(Todo.id).in_(ids))
        else:
            escaped = q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            filters.append(col(Todo.body).like(f"%{escaped}%", escape="\\"))

    count_stmt = select(func.count()).select_from(Todo)
    for condition in filters:
        count_stmt = count_stmt.where(condition)
    total = session.exec(count_stmt).one()

    column = _sort_column(sort)
    ordering = col(column).desc() if order == "desc" else col(column).asc()

    stmt = select(Todo)
    for condition in filters:
        stmt = stmt.where(condition)
    stmt = stmt.order_by(ordering).offset(offset).limit(limit)

    items = list(session.exec(stmt).all())
    return items, int(total)


def get_todo(session: Session, todo_id: int) -> Todo | None:
    return session.get(Todo, todo_id)


def create_todo(session: Session, payload: TodoCreate) -> Todo:
    todo = Todo(body=payload.body)
    session.add(todo)
    session.flush()
    session.refresh(todo)
    return todo


def update_todo(session: Session, todo: Todo, payload: TodoUpdate) -> Todo:
    if payload.body is not None:
        todo.body = payload.body
    if payload.done is not None:
        todo.done = payload.done
    todo.updated_at = datetime.now(UTC)
    session.add(todo)
    session.flush()
    session.refresh(todo)
    return todo


def delete_todo(session: Session, todo: Todo) -> None:
    session.delete(todo)
    session.flush()


def bulk_set_done(session: Session, done: bool) -> int:
    todos = list(session.exec(select(Todo)).all())
    now = datetime.now(UTC)
    for todo in todos:
        todo.done = done
        todo.updated_at = now
        session.add(todo)
    session.flush()
    return len(todos)


def delete_by_done(session: Session, done: bool) -> int:
    todos = list(session.exec(select(Todo).where(col(Todo.done) == done)).all())
    for todo in todos:
        session.delete(todo)
    session.flush()
    return len(todos)
