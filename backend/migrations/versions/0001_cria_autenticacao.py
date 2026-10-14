"""cria tabelas de autenticacao"""
from alembic import op
import sqlalchemy as sa
revision="0001"; down_revision=None; branch_labels=None; depends_on=None
def upgrade():
    op.create_table("usuarios",sa.Column("id",sa.Integer(),primary_key=True),sa.Column("nome",sa.String(160),nullable=False),sa.Column("matricula",sa.String(50),nullable=False),sa.Column("email",sa.String(254),nullable=False),sa.Column("telefone",sa.String(30)),sa.Column("senha_hash",sa.String(255),nullable=False),sa.Column("ativo",sa.Boolean(),nullable=False),sa.Column("criado_em",sa.DateTime(timezone=True),nullable=False),sa.UniqueConstraint("matricula"),sa.UniqueConstraint("email"))
    op.create_index("ix_usuarios_matricula","usuarios",["matricula"]);op.create_index("ix_usuarios_email","usuarios",["email"])
    op.create_table("sessoes",sa.Column("id",sa.Integer(),primary_key=True),sa.Column("usuario_id",sa.Integer(),sa.ForeignKey("usuarios.id",ondelete="CASCADE"),nullable=False),sa.Column("token_hash",sa.String(64),nullable=False),sa.Column("expira_em",sa.DateTime(timezone=True),nullable=False),sa.Column("criada_em",sa.DateTime(timezone=True),nullable=False),sa.UniqueConstraint("token_hash"))
    op.create_index("ix_sessoes_usuario_id","sessoes",["usuario_id"]);op.create_index("ix_sessoes_token_hash","sessoes",["token_hash"])
    op.create_table("recuperacoes_senha",sa.Column("id",sa.Integer(),primary_key=True),sa.Column("usuario_id",sa.Integer(),sa.ForeignKey("usuarios.id",ondelete="CASCADE"),nullable=False),sa.Column("token_hash",sa.String(64),nullable=False),sa.Column("expira_em",sa.DateTime(timezone=True),nullable=False),sa.Column("utilizado_em",sa.DateTime(timezone=True)),sa.UniqueConstraint("token_hash"))
    op.create_index("ix_recuperacoes_usuario_id","recuperacoes_senha",["usuario_id"]);op.create_index("ix_recuperacoes_token_hash","recuperacoes_senha",["token_hash"])
def downgrade():
    op.drop_table("recuperacoes_senha");op.drop_table("sessoes");op.drop_table("usuarios")
