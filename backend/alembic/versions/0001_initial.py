"""initial

Revision ID: 0001_initial
Revises: 
Create Date: 2026-02-09
"""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("full_name", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=200), nullable=False),
        sa.Column("phone", sa.String(length=40), nullable=False),
        sa.Column("role", sa.Enum("COORDENADORA", "COLABORADORA", name="user_role"), nullable=False),
        sa.Column("group_number", sa.Integer(), nullable=False),
        sa.Column("password_hash", sa.String(length=200), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "children",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("guardian_name", sa.String(length=200), nullable=False),
        sa.Column("guardian_phone", sa.String(length=40), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_children_name", "children", ["name"], unique=False)

    op.create_table(
        "ebi",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("ebi_date", sa.Date(), nullable=False),
        sa.Column("group_number", sa.Integer(), nullable=False),
        sa.Column("coordinator_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.Enum("ABERTO", "ENCERRADO", name="ebi_status"), nullable=False),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["coordinator_id"], ["users.id"]),
    )
    op.create_index("ix_ebi_date_group", "ebi", ["ebi_date", "group_number"], unique=False)

    op.create_table(
        "ebi_colaboradoras",
        sa.Column("ebi_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["ebi_id"], ["ebi.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("ebi_id", "user_id"),
    )

    op.create_table(
        "ebi_presence",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("ebi_id", sa.Integer(), nullable=False),
        sa.Column("child_id", sa.Integer(), nullable=False),
        sa.Column("guardian_name_day", sa.String(length=200), nullable=False),
        sa.Column("guardian_phone_day", sa.String(length=40), nullable=False),
        sa.Column("entry_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("exit_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["ebi_id"], ["ebi.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["child_id"], ["children.id"]),
        sa.UniqueConstraint("ebi_id", "child_id", name="uq_presence_ebi_child"),
    )
    op.create_index("ix_presence_ebi", "ebi_presence", ["ebi_id"], unique=False)
    op.create_index("ix_presence_child", "ebi_presence", ["child_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_presence_child", table_name="ebi_presence")
    op.drop_index("ix_presence_ebi", table_name="ebi_presence")
    op.drop_table("ebi_presence")
    op.drop_table("ebi_colaboradoras")
    op.drop_index("ix_ebi_date_group", table_name="ebi")
    op.drop_table("ebi")
    op.drop_index("ix_children_name", table_name="children")
    op.drop_table("children")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS user_role")
    op.execute("DROP TYPE IF EXISTS ebi_status")
