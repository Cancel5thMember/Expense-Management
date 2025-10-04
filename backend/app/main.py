from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import BACKEND_CORS_ORIGINS
from .database import Base, engine, ensure_database_exists
from .routers import auth as auth_router
from .routers import admin as admin_router
from .routers import expenses as expenses_router
from .routers import utils as utils_router
from .routers import company as company_router

app = FastAPI(title="Receipt Path API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.on_event("startup")
def on_startup():
    ensure_database_exists()
    Base.metadata.create_all(bind=engine)


app.include_router(auth_router.router)
app.include_router(admin_router.router)
app.include_router(expenses_router.router)
app.include_router(utils_router.router)
app.include_router(company_router.router)

@app.get("/health")
def health():
    return {"status": "ok"}