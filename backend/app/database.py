from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.engine import url as sa_url
from .config import DATABASE_URL


class Base(DeclarativeBase):
    pass


engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_database_exists():
    """Ensure the target database exists.

    For MySQL/Postgres-like URLs, attempt to create the database.
    For SQLite, no action is required as the file is created on connect.
    """
    u = sa_url.make_url(DATABASE_URL)
    if u.drivername.startswith("sqlite"):
        # SQLite will create the file automatically; nothing to do
        return
    # For MySQL and others that support CREATE DATABASE
    database_name = u.database
    server_url = u.set(database=None)
    server_engine = create_engine(server_url, pool_pre_ping=True)
    try:
        with server_engine.connect() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{database_name}`"))
            conn.commit()
    except Exception:
        # Ignore if not supported or insufficient permissions; startup will fail later if unusable
        pass