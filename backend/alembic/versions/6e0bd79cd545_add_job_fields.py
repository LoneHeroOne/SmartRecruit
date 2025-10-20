"""add_job_fields

Revision ID: 6e0bd79cd545
Revises: ceacb6415b96
Create Date: 2025-10-13 16:01:46.635054

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6e0bd79cd545'
down_revision: Union[str, Sequence[str], None] = 'ceacb6415b96'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
