"""'rename_internship_to_job_add_fields'

Revision ID: 05024e55a6bb
Revises: b1990ad76f8e
Create Date: 2025-10-03 12:47:57.845424

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '05024e55a6bb'
down_revision: Union[str, Sequence[str], None] = 'b1990ad76f8e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Rename internships to jobs
    op.rename_table('internships', 'jobs')
    # Drop the old index if exists
    op.drop_index(op.f('ix_internships_id'), table_name='jobs')
    # Add contract_type to jobs
    op.add_column('jobs', sa.Column('contract_type', sa.String(), nullable=True))
    # Add status to applications
    op.add_column('applications', sa.Column('status', sa.String(), nullable=True))
    # Rename column internship_id to job_id in applications
    op.alter_column('applications', 'internship_id', new_column_name='job_id')
    # The foreign key is already pointing to jobs since table renamed, but constraint name changes?
    # Actually, the constraint name will be adjusted if needed, but since renamed, it points to jobs.
    # Add role to users
    op.add_column('users', sa.Column('role', sa.String(), nullable=True))
    op.alter_column('users', 'is_admin',
               existing_type=sa.BOOLEAN(),
               server_default=None,
               existing_nullable=False)
    # Create match_analyses table
    op.create_table('match_analyses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('keywords_matched', sa.Text(), nullable=True),
        sa.Column('cv_id', sa.Integer(), nullable=True),
        sa.Column('job_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['cv_id'], ['cvs.id'], ),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # Drop match_analyses table
    op.drop_table('match_analyses')
    # Rename jobs back to internships
    op.rename_table('jobs', 'internships')
    # Drop contract_type from jobs (now internships)
    op.drop_column('internships', 'contract_type')
    # Alter column back
    op.alter_column('internships', 'id', existing_type=sa.INTEGER(), autoincrement=True)
    # Add index
    op.create_index(op.f('ix_internships_id'), 'internships', ['id'], unique=False)
    # Alter applications
    op.drop_column('users', 'role')
    op.alter_column('users', 'is_admin',
               existing_type=sa.BOOLEAN(),
               server_default=sa.text('false'),
               existing_nullable=False)
    op.add_column('applications', sa.Column('internship_id', sa.INTEGER(), autoincrement=False, nullable=True))
    # Since the foreign key points to jobs, but now renamed to internships, need to recreate fkey
    op.create_foreign_key(op.f('applications_internship_id_fkey'), 'applications', 'internships', ['internship_id'], ['id'])
    op.drop_column('applications', 'job_id')
    op.drop_column('applications', 'status')
    # ### end Alembic commands ###
