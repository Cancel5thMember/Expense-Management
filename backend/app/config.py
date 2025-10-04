import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Load default .env from CWD and backend/.env for convenience
load_dotenv()
backend_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path=backend_env_path)

# Basic auth/JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-change-me")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Build DATABASE_URL from MYSQL_* if not explicitly set
_explicit_db_url = os.getenv("DATABASE_URL")
if _explicit_db_url:
    DATABASE_URL = _explicit_db_url
else:
    # Temporarily force SQLite for local smoke tests; remove once MySQL credentials are fixed
    DATABASE_URL = "sqlite:///./receiptpath.db"

# CORS: prefer BACKEND_CORS_ORIGINS, fallback to ALLOWED_ORIGINS for compatibility
_cors_env = os.getenv("BACKEND_CORS_ORIGINS") or os.getenv("ALLOWED_ORIGINS")
if _cors_env:
    BACKEND_CORS_ORIGINS = [o.strip() for o in _cors_env.split(",") if o.strip()]
else:
    BACKEND_CORS_ORIGINS = [
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:8082",
        "http://127.0.0.1:8082",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]