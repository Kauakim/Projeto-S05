import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Usuario

SECRET_KEY = os.getenv("SECRET_KEY", "inatel-portal-s05-jwt-secret-key-2026")
TOKEN_EXPIRE_SECONDS = 60 * 60 * 24 * 7  # 7 dias
PBKDF2_ITERATIONS = 260_000

security_bearer = HTTPBearer(auto_error=False)


def hash_password(plain_password: str) -> str:
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac(
        "sha256",
        plain_password.encode("utf-8"),
        salt.encode("utf-8"),
        PBKDF2_ITERATIONS,
    )
    digest = base64.urlsafe_b64encode(dk).decode("ascii")
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt}${digest}"


def verify_password(plain_password: str, stored_hash: str) -> bool:
    if not stored_hash or "$" not in stored_hash:
        return False
    try:
        algo, iter_str, salt, expected_digest = stored_hash.split("$", 3)
        if algo != "pbkdf2_sha256":
            return False
        dk = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            int(iter_str),
        )
        actual_digest = base64.urlsafe_b64encode(dk).decode("ascii")
        return hmac.compare_digest(actual_digest, expected_digest)
    except Exception:
        return False


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(segment: str) -> bytes:
    padding = "=" * (-len(segment) % 4)
    return base64.urlsafe_b64decode(segment + padding)


def create_access_token(user_id: int) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": str(user_id),
        "iat": int(time.time()),
        "exp": int(time.time()) + TOKEN_EXPIRE_SECONDS,
    }
    h_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    p_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{h_b64}.{p_b64}".encode("ascii")
    sig = hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
    return f"{h_b64}.{p_b64}.{_b64url_encode(sig)}"


def decode_access_token(token: str) -> int:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Token malformado")
        h_b64, p_b64, s_b64 = parts
        signing_input = f"{h_b64}.{p_b64}".encode("ascii")
        expected_sig = hmac.new(
            SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256
        ).digest()
        actual_sig = _b64url_decode(s_b64)
        if not hmac.compare_digest(actual_sig, expected_sig):
            raise ValueError("Assinatura inválida")

        payload = json.loads(_b64url_decode(p_b64).decode("utf-8"))
        if int(payload.get("exp", 0)) < int(time.time()):
            raise ValueError("Sessão expirada")

        return int(payload["sub"])
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão inválida ou expirada. Faça login novamente.",
        ) from exc


async def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(security_bearer),
    db: AsyncSession = Depends(get_db),
) -> Usuario:
    if creds is None or not creds.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticação necessária. Faça login para continuar.",
        )

    user_id = decode_access_token(creds.credentials)
    res = await db.execute(select(Usuario).where(Usuario.id == user_id))
    user = res.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado. Faça login novamente.",
        )
    return user


async def get_optional_user(
    creds: HTTPAuthorizationCredentials | None = Depends(security_bearer),
    db: AsyncSession = Depends(get_db),
) -> Usuario | None:
    if creds is None or not creds.credentials:
        return None
    try:
        user_id = decode_access_token(creds.credentials)
        res = await db.execute(select(Usuario).where(Usuario.id == user_id))
        return res.scalar_one_or_none()
    except HTTPException:
        return None

