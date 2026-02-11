"""add child guardians

Revision ID: 0003_add_child_guardians
Revises: 0002_add_ebi_audit
Create Date: 2026-02-10
"""

from alembic import op
import sqlalchemy as sa

revision = "0003_add_child_guardians"
down_revision = "0002_add_ebi_audit"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "child_guardians",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("child_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("phone", sa.String(length=40), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["child_id"], ["children.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_child_guardians_child_id", "child_guardians", ["child_id"], unique=False)

    op.execute(
        """
        INSERT INTO child_guardians (child_id, name, phone, created_at, updated_at)
        SELECT id, guardian_name, guardian_phone, now(), now()
        FROM children
        WHERE guardian_name IS NOT NULL AND guardian_phone IS NOT NULL
        """
    )


def downgrade() -> None:
    op.drop_index("ix_child_guardians_child_id", table_name="child_guardians")
    op.drop_table("child_guardians")
