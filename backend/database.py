import os
import re
from pathlib import Path
from typing import AsyncGenerator
from dotenv import load_dotenv
from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import (
    AsyncConnection,
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

# Carrega o .env da raiz do repositório (S05/.env)
ROOT_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=ROOT_ENV_PATH)

DEFAULT_PG_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/inatel"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_PG_URL).strip() or DEFAULT_PG_URL
FALLBACK_SQLITE_PATH = Path(__file__).resolve().parent / "inatel_local.db"
FALLBACK_SQLITE_URL = f"sqlite+aiosqlite:///{FALLBACK_SQLITE_PATH.as_posix()}"


class Base(DeclarativeBase):
    pass


engine: AsyncEngine | None = None
SessionLocal: async_sessionmaker[AsyncSession] | None = None
active_db_mode: str = "uninitialized"


async def _ensure_schema_migrations(conn: AsyncConnection) -> None:
    """Garante que bancos já criados anteriormente recebam novas colunas acadêmicas, autenticação e notícias."""

    def get_existing_columns(sync_conn) -> dict[str, set[str]]:
        insp = inspect(sync_conn)
        result: dict[str, set[str]] = {}
        for tbl in ("usuarios", "aulas", "noticias"):
            if insp.has_table(tbl):
                result[tbl] = {c["name"] for c in insp.get_columns(tbl)}
        return result

    existing = await conn.run_sync(get_existing_columns)

    if "usuarios" in existing:
        u_cols = existing["usuarios"]
        if "senha_hash" not in u_cols:
            await conn.execute(
                text("ALTER TABLE usuarios ADD COLUMN senha_hash VARCHAR(255) NOT NULL DEFAULT ''")
            )
        if "crs" not in u_cols:
            if "ira" in u_cols:
                await conn.execute(text("ALTER TABLE usuarios RENAME COLUMN ira TO crs"))
            else:
                await conn.execute(
                    text("ALTER TABLE usuarios ADD COLUMN crs FLOAT NOT NULL DEFAULT 84.5")
                )
        adicionou_ac = False
        if "horas_ac" not in u_cols:
            await conn.execute(
                text("ALTER TABLE usuarios ADD COLUMN horas_ac INTEGER NOT NULL DEFAULT 112")
            )
            adicionou_ac = True
        if "meta_ac" not in u_cols:
            await conn.execute(
                text("ALTER TABLE usuarios ADD COLUMN meta_ac INTEGER NOT NULL DEFAULT 160")
            )
        if "horas_cp" not in u_cols:
            await conn.execute(
                text("ALTER TABLE usuarios ADD COLUMN horas_cp INTEGER NOT NULL DEFAULT 28")
            )
        if "meta_cp" not in u_cols:
            await conn.execute(
                text("ALTER TABLE usuarios ADD COLUMN meta_cp INTEGER NOT NULL DEFAULT 40")
            )
        if "horas_trilha" not in u_cols:
            await conn.execute(
                text("ALTER TABLE usuarios ADD COLUMN horas_trilha INTEGER NOT NULL DEFAULT 80")
            )
        if "meta_trilha" not in u_cols:
            await conn.execute(
                text("ALTER TABLE usuarios ADD COLUMN meta_trilha INTEGER NOT NULL DEFAULT 120")
            )
        if adicionou_ac:
            await conn.execute(
                text("UPDATE usuarios SET horas_ac = horas_complementares, meta_ac = meta_horas")
            )

        # Normaliza matrículas legadas (ex: 'GES-2048' -> 2048) para inteiro entre 0 e 999999
        res_mats = await conn.execute(text("SELECT id, matricula FROM usuarios ORDER BY id ASC"))
        usados: set[int] = set()
        ajustes: list[tuple[int, int]] = []
        for row_id, raw_mat in res_mats.fetchall():
            texto_mat = str(raw_mat or "").strip()
            digitos = re.sub(r"\D", "", texto_mat)
            num = int(digitos[:6]) if digitos else int(row_id)
            num = max(0, min(999999, num))
            while num in usados:
                num = (num + 1) % 1000000
            usados.add(num)
            if not isinstance(raw_mat, int) or raw_mat != num:
                ajustes.append((int(row_id), num))

        for uid, novo_num in ajustes:
            await conn.execute(
                text("UPDATE usuarios SET matricula = :mat WHERE id = :uid"),
                {"mat": novo_num, "uid": uid},
            )

        if conn.dialect.name == "postgresql":
            await conn.execute(
                text("ALTER TABLE usuarios ALTER COLUMN matricula TYPE INTEGER USING matricula::integer")
            )

    if "aulas" in existing:
        a_cols = existing["aulas"]
        if "usuario_id" not in a_cols:
            await conn.execute(text("ALTER TABLE aulas ADD COLUMN usuario_id INTEGER"))
        if "turma" not in a_cols:
            await conn.execute(
                text("ALTER TABLE aulas ADD COLUMN turma VARCHAR(30) NOT NULL DEFAULT 'A'")
            )
        if "avaliacoes_json" not in a_cols:
            await conn.execute(
                text("ALTER TABLE aulas ADD COLUMN avaliacoes_json TEXT NOT NULL DEFAULT '[]'")
            )

    if "noticias" in existing:
        if "url_original" not in existing["noticias"]:
            await conn.execute(
                text("ALTER TABLE noticias ADD COLUMN url_original VARCHAR(600) DEFAULT ''")
            )
        if "fonte_nome" not in existing["noticias"]:
            await conn.execute(
                text("ALTER TABLE noticias ADD COLUMN fonte_nome VARCHAR(120) DEFAULT ''")
            )


async def init_database() -> str:
    """
    Tenta conectar e criar as tabelas no PostgreSQL configurado no .env da raiz.
    Caso o serviço PostgreSQL não esteja rodando localmente no momento do teste,
    ativa automaticamente o fallback local assíncrono (SQLite) com o mesmo schema ORM,
    garantindo que `npm start` funcione de primeira sem travar a API.
    """
    global engine, SessionLocal, active_db_mode

    import models  # noqa: F401

    connect_args = {}
    if DATABASE_URL.startswith("postgresql+asyncpg"):
        connect_args = {"timeout": 2.5}

    try:
        pg_engine = create_async_engine(
            DATABASE_URL,
            echo=False,
            pool_pre_ping=True,
            connect_args=connect_args,
        )
        async with pg_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            await _ensure_schema_migrations(conn)

        engine = pg_engine
        SessionLocal = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
        active_db_mode = "postgresql"
        print("[DB] Conectado com sucesso ao PostgreSQL configurado no .env!")
    except Exception as exc:
        print(
            f"[DB] Aviso: PostgreSQL indisponível ({exc.__class__.__name__}). "
            f"Usando banco local de fallback ({FALLBACK_SQLITE_PATH.name}) para testes locais."
        )
        sqlite_engine = create_async_engine(
            FALLBACK_SQLITE_URL,
            echo=False,
        )
        async with sqlite_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            await _ensure_schema_migrations(conn)

        engine = sqlite_engine
        SessionLocal = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
        active_db_mode = "sqlite-fallback"

    return active_db_mode


async def close_database() -> None:
    global engine
    if engine is not None:
        await engine.dispose()


def get_db_status() -> dict:
    return {
        "mode": active_db_mode,
        "configured_postgres": DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else DATABASE_URL,
    }


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    if SessionLocal is None:
        await init_database()
    assert SessionLocal is not None
    async with SessionLocal() as session:
        yield session
