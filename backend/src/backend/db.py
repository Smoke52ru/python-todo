from collections.abc import Generator

from sqlalchemy import event
from sqlalchemy.engine import Engine
from sqlmodel import Session, SQLModel, create_engine

from backend.settings import BACKEND_ROOT, get_settings

_settings = get_settings()
connect_args = (
    {"check_same_thread": False} if _settings.database_url.startswith("sqlite") else {}
)
engine = create_engine(
    _settings.database_url,
    connect_args=connect_args,
    echo=False,
)


@event.listens_for(Engine, "connect")
def _set_sqlite_pragma(dbapi_connection, connection_record) -> None:  # noqa: ARG001
    if not _settings.database_url.startswith("sqlite"):
        return
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA busy_timeout=5000")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


def init_db() -> None:
    """Create tables if needed, then ensure FTS5 support."""
    # Bootstrap schema for local/dev without requiring a manual alembic step.
    # Alembic migrations remain the source of truth for production evolves.
    SQLModel.metadata.create_all(engine)
    _stamp_alembic_if_needed()
    _ensure_fts()


def _stamp_alembic_if_needed() -> None:
    """Mark the DB as being at head when tables were created via metadata."""
    try:
        from alembic.config import Config
        from alembic.runtime.migration import MigrationContext
        from alembic.script import ScriptDirectory

        cfg = Config(str(BACKEND_ROOT / "alembic.ini"))
        cfg.set_main_option("sqlalchemy.url", _settings.database_url)
        cfg.set_main_option("script_location", str(BACKEND_ROOT / "alembic"))
        script = ScriptDirectory.from_config(cfg)
        head = script.get_current_head()
        with engine.connect() as connection:
            context = MigrationContext.configure(connection)
            if context.get_current_revision() is None and head is not None:
                context.stamp(script, head)
                connection.commit()
    except Exception:
        # Non-fatal: app can still run with create_all schema.
        return


def _ensure_fts() -> None:
    """Create FTS5 virtual table and triggers if missing (SQLite only)."""
    if not _settings.database_url.startswith("sqlite"):
        return
    with engine.begin() as connection:
        connection.exec_driver_sql(
            """
            CREATE VIRTUAL TABLE IF NOT EXISTS todos_fts USING fts5(
                body,
                content='todos',
                content_rowid='id'
            )
            """
        )
        connection.exec_driver_sql(
            """
            CREATE TRIGGER IF NOT EXISTS todos_ai AFTER INSERT ON todos BEGIN
                INSERT INTO todos_fts(rowid, body) VALUES (new.id, new.body);
            END
            """
        )
        connection.exec_driver_sql(
            """
            CREATE TRIGGER IF NOT EXISTS todos_ad AFTER DELETE ON todos BEGIN
                INSERT INTO todos_fts(todos_fts, rowid, body)
                VALUES('delete', old.id, old.body);
            END
            """
        )
        connection.exec_driver_sql(
            """
            CREATE TRIGGER IF NOT EXISTS todos_au AFTER UPDATE ON todos BEGIN
                INSERT INTO todos_fts(todos_fts, rowid, body)
                VALUES('delete', old.id, old.body);
                INSERT INTO todos_fts(rowid, body) VALUES (new.id, new.body);
            END
            """
        )
        # Rebuild FTS index if empty but todos exist (e.g. after migration).
        count = connection.exec_driver_sql("SELECT COUNT(*) FROM todos_fts").scalar()
        todos_count = connection.exec_driver_sql("SELECT COUNT(*) FROM todos").scalar()
        if count == 0 and todos_count and todos_count > 0:
            connection.exec_driver_sql(
                "INSERT INTO todos_fts(rowid, body) SELECT id, body FROM todos"
            )


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
