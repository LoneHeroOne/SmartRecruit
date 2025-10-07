"""add_unique_constraint_user_job_applications

Revision ID: 47fa30d14db0
Revises: abd9bc51d2e9
Create Date: 2025-10-05 14:25:49.496276

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '47fa30d14db0'
down_revision: Union[str, Sequence[str], None] = 'abd9bc51d2e9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
