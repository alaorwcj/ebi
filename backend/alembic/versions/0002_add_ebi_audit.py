"""add ebi audit

Revision ID: 0002_add_ebi_audit
Revises: 0001_initial
Create Date: 2026-02-09
"""

from alembic import op
import sqlalchemy as sa

revision = "0002_add_ebi_audit"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ebi_audit",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("ebi_id", sa.Integer(), nullable=False),
        sa.Column("action", sa.String(length=50), nullable=False),
        sa.Column("performed_by", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["ebi_id"], ["ebi.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["performed_by"], ["users.id"]),
    )
    op.create_index("ix_ebi_audit_ebi_id", "ebi_audit", ["ebi_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_ebi_audit_ebi_id", table_name="ebi_audit")
    op.drop_table("ebi_audit")
