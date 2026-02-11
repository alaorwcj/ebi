"""fix user documents timestamps

Revision ID: 0006_fix_user_docs_ts
Revises: 0005_add_user_profile_documents
Create Date: 2026-02-10

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0006_fix_user_docs_ts"
down_revision = "0005_add_user_profile_documents"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Ensure timestamps have defaults and timezone support
    op.alter_column(
        "user_documents",
        "created_at",
        type_=sa.DateTime(timezone=True),
        server_default=sa.text("now()"),
        existing_type=sa.DateTime(),
        nullable=False,
    )
    op.alter_column(
        "user_documents",
        "updated_at",
        type_=sa.DateTime(timezone=True),
        server_default=sa.text("now()"),
        existing_type=sa.DateTime(),
        nullable=False,
    )

    # Backfill any null timestamps (safety)
    op.execute("UPDATE user_documents SET created_at = now() WHERE created_at IS NULL")
    op.execute("UPDATE user_documents SET updated_at = now() WHERE updated_at IS NULL")


def downgrade() -> None:
    op.alter_column(
        "user_documents",
        "updated_at",
        type_=sa.DateTime(),
        server_default=None,
        existing_type=sa.DateTime(timezone=True),
        nullable=False,
    )
    op.alter_column(
        "user_documents",
        "created_at",
        type_=sa.DateTime(),
        server_default=None,
        existing_type=sa.DateTime(timezone=True),
        nullable=False,
    )
