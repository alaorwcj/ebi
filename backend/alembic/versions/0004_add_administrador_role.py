"""add administrador role

Revision ID: 0004_add_administrador_role
Revises: 0003_add_child_guardians
Create Date: 2026-02-10

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = '0004_add_administrador_role'
down_revision = '0003_add_child_guardians'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add ADMINISTRADOR to the user_role enum
    op.execute("ALTER TYPE user_role ADD VALUE 'ADMINISTRADOR'")


def downgrade() -> None:
    # Note: PostgreSQL doesn't support removing enum values directly
    # This would require recreating the enum type, which is complex
    # and potentially dangerous in production
    pass
