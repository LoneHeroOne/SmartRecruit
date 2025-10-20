"""add_cover_letter_and_cv_id_to_applications

Revision ID: add_cover_letter_and_cv_id_to_applications
Revises: add_company_logo_and_desc
Create Date: 2025-10-15 13:08:40.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_cover_letter_and_cv_id_to_applications'
down_revision: Union[str, Sequence[str], None] = 'add_company_logo_and_desc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("applications", sa.Column("cover_letter", sa.Text(), nullable=True))
    op.add_column("applications", sa.Column("cv_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_applications_cv_id_cvs",
        "applications", "cvs",
        ["cv_id"], ["id"],
        ondelete="SET NULL"
    )


def downgrade() -> None:
    op.drop_constraint("fk_applications_cv_id_cvs", "applications", type_="foreignkey")
    op.drop_column("applications", "cv_id")
    op.drop_column("applications", "cover_letter")
