from collections import defaultdict
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
import secrets

from fastapi import Cookie, Depends, FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from .database import SessionLocal, get_db
from .mailer import EmailDeliveryError, send_temporary_password
from .models import Sessao, Usuario
from .schemas import AlteracaoSenhaEntrada, LoginEntrada, RecuperacaoEntrada
from .security import hash_password, hash_token, new_token, verify_password
from .seed import seed_fixed_users

LOGIN_WINDOW = timedelta(minutes=15)
MAX_LOGIN_ATTEMPTS = 5
failed_logins: dict[str, list[datetime]] = defaultdict(list)

@asynccontextmanager
async def lifespan(_: FastAPI):
    with SessionLocal() as db:
        seed_fixed_users(db)
    yield

app = FastAPI(title="Nobe Estágios API", version="2.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def utc_expiration(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)

def get_session_user(token: str | None, db: Session) -> tuple[Sessao, Usuario]:
    if not token:
        raise HTTPException(401, "Sessão inválida.")
    session = db.scalar(select(Sessao).where(Sessao.token_hash == hash_token(token)))
    if not session or utc_expiration(session.expira_em) < datetime.now(timezone.utc):
        raise HTTPException(401, "Sessão expirada.")
    user = db.get(Usuario, session.usuario_id)
    if not user or not user.ativo:
        raise HTTPException(401, "Sessão inválida.")
    return session, user

def login_key(request: Request, code: str) -> str:
    host = request.client.host if request.client else "unknown"
    return f"{host}:{code}"

def check_login_limit(key: str) -> None:
    cutoff = datetime.now(timezone.utc) - LOGIN_WINDOW
    failed_logins[key] = [attempt for attempt in failed_logins[key] if attempt > cutoff]
    if len(failed_logins[key]) >= MAX_LOGIN_ATTEMPTS:
        raise HTTPException(429, "Muitas tentativas. Aguarde 15 minutos e tente novamente.")

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/auth/login")
def login(data: LoginEntrada, request: Request, response: Response, db: Session = Depends(get_db)):
    key = login_key(request, data.codigo)
    check_login_limit(key)
    user = db.scalar(select(Usuario).where(Usuario.matricula == data.codigo))
    if not user or not user.ativo or not verify_password(data.senha, user.senha_hash):
        failed_logins[key].append(datetime.now(timezone.utc))
        raise HTTPException(401, "Credenciais inválidas.")

    failed_logins.pop(key, None)
    db.execute(delete(Sessao).where(Sessao.usuario_id == user.id))
    token = new_token()
    db.add(Sessao(
        usuario_id=user.id,
        token_hash=hash_token(token),
        expira_em=datetime.now(timezone.utc) + timedelta(hours=8),
    ))
    db.commit()
    response.set_cookie("nobe_session", token, httponly=True, secure=False, samesite="strict", max_age=28800)
    return {"nome": user.nome, "codigo": user.matricula, "deve_alterar_senha": user.deve_alterar_senha}

@app.get("/api/auth/me")
def me(nobe_session: str | None = Cookie(default=None), db: Session = Depends(get_db)):
    _, user = get_session_user(nobe_session, db)
    return {"id": user.id, "nome": user.nome, "codigo": user.matricula, "deve_alterar_senha": user.deve_alterar_senha}

@app.post("/api/auth/alterar-senha", status_code=204)
def change_password(data: AlteracaoSenhaEntrada, response: Response, nobe_session: str | None = Cookie(default=None), db: Session = Depends(get_db)):
    _, user = get_session_user(nobe_session, db)
    if verify_password(data.nova_senha, user.senha_hash):
        raise HTTPException(400, "A nova senha deve ser diferente da senha temporária.")
    user.senha_hash = hash_password(data.nova_senha)
    user.deve_alterar_senha = False
    db.execute(delete(Sessao).where(Sessao.usuario_id == user.id))
    db.commit()
    response.delete_cookie("nobe_session")

@app.post("/api/auth/logout", status_code=204)
def logout(response: Response, nobe_session: str | None = Cookie(default=None), db: Session = Depends(get_db)):
    if nobe_session:
        session = db.scalar(select(Sessao).where(Sessao.token_hash == hash_token(nobe_session)))
        if session:
            db.delete(session)
            db.commit()
    response.delete_cookie("nobe_session")

@app.post("/api/auth/esqueci-senha")
def recover_password(data: RecuperacaoEntrada, db: Session = Depends(get_db)):
    user = db.scalar(select(Usuario).where(Usuario.matricula == data.codigo, Usuario.ativo.is_(True)))
    if not user:
        return {"mensagem": "Se o código estiver ativo, a administração receberá as instruções."}

    temporary_password = f"{secrets.token_urlsafe(12)}!9a"
    try:
        send_temporary_password(user.matricula, temporary_password)
    except EmailDeliveryError as exc:
        raise HTTPException(503, str(exc)) from exc

    user.senha_hash = hash_password(temporary_password)
    user.deve_alterar_senha = True
    db.execute(delete(Sessao).where(Sessao.usuario_id == user.id))
    db.commit()
    return {"mensagem": "Se o código estiver ativo, a administração receberá as instruções."}
