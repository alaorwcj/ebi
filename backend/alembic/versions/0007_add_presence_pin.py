"""add presence pin

Revision ID: 0007_add_presence_pin
Revises: 0006_fix_user_docs_ts
Create Date: 2026-02-10

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0007_add_presence_pin"
down_revision = "0006_fix_user_docs_ts"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("ebi_presence", sa.Column("pin_code", sa.String(length=4), nullable=True))
    op.execute("UPDATE ebi_presence SET pin_code = '0000' WHERE pin_code IS NULL")
    op.alter_column("ebi_presence", "pin_code", nullable=False)


def downgrade() -> None:
    op.drop_column("ebi_presence", "pin_code")
