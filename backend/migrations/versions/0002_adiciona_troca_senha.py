"""adiciona controle de troca de senha

Revision ID: 0002
Revises: 0001
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("usuarios", sa.Column("deve_alterar_senha", sa.Boolean(), nullable=False, server_default=sa.true()))

def downgrade():
    op.drop_column("usuarios", "deve_alterar_senha")
