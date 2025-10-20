"""add_company_logo_and_desc

Revision ID: add_company_logo_and_desc
Revises: ceacb6415b96
Create Date: 2025-10-15 12:18:34.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_company_logo_and_desc'
down_revision: Union[str, Sequence[str], None] = 'ceacb6415b96'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("company_logo_url", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("company_description", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "company_description")
    op.drop_column("users", "company_logo_url")
