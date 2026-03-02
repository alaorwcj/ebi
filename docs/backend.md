# Backend Architecture

The internal backend uses **Python 3.11+**, **FastAPI**, and **SQLAlchemy**.

## Folder Structure (backend/)
- `app/api`: FastAPI Routers and Endpoints configuration.
- `app/core`: Configuration (`config.py`), security wrappers.
- `app/models`: SQLAlchemy Database Entities.
- `app/schemas`: Pydantic Models for Data Validation (Request/Response mapping).
- `app/services`: Core Business Logic layer separating views from database interaction.
- `app/repositories`: Logic for interacting with the database.
- `alembic/`: Database migrations.
- `tests/`: Automated test suite.

## The API
All REST routes are prefixed with `/api/v1` and use token-based authentication (Bearer).

Example endpoint workflow:
1. `GET /api/v1/users` is mapped in a `<Feature>.py` route file.
2. The route injects a `Session` (database dependency).
3. The route calls `UserService.get_users(db)`.
4. `UserService` fetches SQLAlchemy `User` models from the database.
5. The route returns these models, which FastAPI parses via Pydantic `UserResponse` schemas.

## Data Migrations
The database schema is heavily version-controlled using Alembic.
Every time an entity mapping in `models/` changes, an Alembic script is generated:
```bash
alembic revision --autogenerate -m "added new column"
alembic upgrade head
```
