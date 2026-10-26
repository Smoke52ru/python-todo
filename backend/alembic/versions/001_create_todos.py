"""create todos table

Revision ID: 001
Revises:
Create Date: 2026-10-26

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "todos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("body", sa.String(length=500), nullable=False),
        sa.Column("done", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_todos_body"), "todos", ["body"], unique=False)
    op.create_index(op.f("ix_todos_done"), "todos", ["done"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_todos_done"), table_name="todos")
    op.drop_index(op.f("ix_todos_body"), table_name="todos")
    op.drop_table("todos")
