import hashlib, secrets
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

hasher = PasswordHasher()
def hash_password(password: str) -> str: return hasher.hash(password)
def verify_password(password: str, password_hash: str) -> bool:
    try: return hasher.verify(password_hash, password)
    except VerifyMismatchError: return False
def new_token() -> str: return secrets.token_urlsafe(48)
def hash_token(token: str) -> str: return hashlib.sha256(token.encode()).hexdigest()
