import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.admin import router as admin_router
from routes.health import router as health_router
from routes.tools import router as tools_router
from routes.users import router as users_router

app = FastAPI(title="Claridge API", version="0.1.0")

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=None,
    expose_headers=[],
    max_age=600,
)

app.include_router(health_router)
app.include_router(tools_router)
app.include_router(users_router)
app.include_router(admin_router)