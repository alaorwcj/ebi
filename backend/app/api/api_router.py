from fastapi import APIRouter

from app.api.routes import auth, children, ebi, health, reports, users

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(children.router, prefix="/children", tags=["children"])
api_router.include_router(ebi.router, prefix="/ebi", tags=["ebi"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
