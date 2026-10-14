from sqlalchemy import select
from sqlalchemy.orm import Session
from .models import Usuario
from .security import hash_password
from .settings import settings

FIXED_USERS = (
    ("1001", "Usuário 1001", settings.initial_password_1001),
    ("1002", "Usuário 1002", settings.initial_password_1002),
    ("1003", "Usuário 1003", settings.initial_password_1003),
    ("1004", "Usuário 1004", settings.initial_password_1004),
    ("1005", "Usuário 1005", settings.initial_password_1005),
    ("1006", "Usuário 1006", settings.initial_password_1006),
)

def seed_fixed_users(db: Session) -> None:
    missing_passwords = [code for code, _, password in FIXED_USERS if not password]
    if missing_passwords:
        raise RuntimeError(f"Defina as senhas iniciais no arquivo backend/.env: {', '.join(missing_passwords)}")
    fixed_codes = {code for code, _, _ in FIXED_USERS}
    for existing_user in db.scalars(select(Usuario)):
        if existing_user.matricula not in fixed_codes:
            existing_user.ativo = False

    for code, name, password in FIXED_USERS:
        user = db.scalar(select(Usuario).where(Usuario.matricula == code))
        if user:
            if user.email != f"{code}@acesso.local":
                user.senha_hash = hash_password(password)
                user.deve_alterar_senha = True
            user.nome = name
            user.email = f"{code}@acesso.local"
            user.ativo = True
            continue
        db.add(Usuario(
            nome=name,
            matricula=code,
            email=f"{code}@acesso.local",
            senha_hash=hash_password(password),
            deve_alterar_senha=True,
        ))
    db.commit()
