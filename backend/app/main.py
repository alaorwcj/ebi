from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api_router import api_router
from app.api.error_handlers import add_error_handlers
from app.core.config import settings


def create_app() -> FastAPI:
    app = FastAPI(title="EBI Vila Paula API", version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"] ,
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix="/api/v1")
    add_error_handlers(app)
    return app


app = create_app()
