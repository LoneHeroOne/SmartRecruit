"""cv uploaded_at default now

Revision ID: e6d743d8a2a6
Revises: 86614ed6b155
Create Date: 2025-10-09 18:01:30.258788

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e6d743d8a2a6'
down_revision: Union[str, Sequence[str], None] = '86614ed6b155'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "cvs", "uploaded_at",
        existing_type=sa.DateTime(timezone=True),
        server_default=sa.text("NOW()"),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "cvs", "uploaded_at",
        existing_type=sa.DateTime(timezone=True),
        server_default=None,
        existing_nullable=True,
    )
