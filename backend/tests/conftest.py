import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

# Use in-memory DB before importing the app modules that create the engine.
os.environ["DATABASE_URL"] = "sqlite://"

from backend.db import get_session  # noqa: E402
from backend.main import create_app  # noqa: E402
from backend.settings import get_settings  # noqa: E402


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    get_settings.cache_clear()
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    # Minimal FTS stubs for in-memory tests: fall back works without FTS table
    # by catching missing table — ensure FTS exists as empty virtual table.
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

    def override_session() -> Generator[Session, None, None]:
        with Session(engine) as session:
            try:
                yield session
                session.commit()
            except Exception:
                session.rollback()
                raise

    app = create_app()
    app.dependency_overrides[get_session] = override_session

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    get_settings.cache_clear()
