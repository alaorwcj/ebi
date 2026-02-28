import traceback

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette import status


def add_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "type": "https://example.com/validation-error",
                "title": "Validation error",
                "status": status.HTTP_422_UNPROCESSABLE_ENTITY,
                "detail": "Invalid request payload",
                "errors": exc.errors(),
                "instance": str(request.url),
            },
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        traceback.print_exc()
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "type": "https://example.com/internal-error",
                "title": "Internal server error",
                "status": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "detail": str(exc),
                "instance": str(request.url),
            },
        )
