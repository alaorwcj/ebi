"""add user profile and documents

Revision ID: 0005_add_user_profile_documents
Revises: 0004_add_administrador_role
Create Date: 2026-02-10

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0005_add_user_profile_documents'
down_revision = '0004_add_administrador_role'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add personal data fields to users table
    op.add_column('users', sa.Column('cpf', sa.String(length=14), nullable=True))
    op.add_column('users', sa.Column('rg', sa.String(length=20), nullable=True))
    op.add_column('users', sa.Column('birth_date', sa.Date(), nullable=True))
    op.add_column('users', sa.Column('address', sa.String(length=300), nullable=True))
    op.add_column('users', sa.Column('city', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('state', sa.String(length=2), nullable=True))
    op.add_column('users', sa.Column('zip_code', sa.String(length=10), nullable=True))
    op.add_column('users', sa.Column('emergency_contact_name', sa.String(length=200), nullable=True))
    op.add_column('users', sa.Column('emergency_contact_phone', sa.String(length=40), nullable=True))
    
    # Create indexes for CPF
    op.create_index(op.f('ix_users_cpf'), 'users', ['cpf'], unique=True)

    # Create user_documents table (enum will be created automatically)
    op.create_table(
        'user_documents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('document_type', sa.Enum(
            'ANTECEDENTES_CRIMINAIS',
            'CERTIDAO_NEGATIVA_ESTADUAL',
            'RG',
            'CPF',
            'COMPROVANTE_RESIDENCIA',
            'ATESTADO_SAUDE',
            'OUTROS',
            name='document_type'
        ), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('file_data', sa.LargeBinary(), nullable=False),
        sa.Column('mime_type', sa.String(length=100), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('user_documents')
    op.execute("DROP TYPE document_type")
    op.drop_index(op.f('ix_users_cpf'), table_name='users')
    op.drop_column('users', 'emergency_contact_phone')
    op.drop_column('users', 'emergency_contact_name')
    op.drop_column('users', 'zip_code')
    op.drop_column('users', 'state')
    op.drop_column('users', 'city')
    op.drop_column('users', 'address')
    op.drop_column('users', 'birth_date')
    op.drop_column('users', 'rg')
    op.drop_column('users', 'cpf')
