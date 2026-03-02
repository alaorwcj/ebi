# Local Development and Deployment

EBI Vila Paula is built to primarily be deployed via Docker Compose to ensure environmental parity, but it can be developed locally without containers.

## Running With Docker Compose
Ensure you have `docker` and `docker compose` installed.

1. **Copy the Env file**
    `cp .env.example .env`

2. **Run Compose**
    `docker compose up --build`
    - Frontend becomes available at: `http://localhost:5173`
    - Backend becomes available at: `http://localhost:8000/docs`

3. **Migrate the Database**
    Run the migrations before interacting:
    `docker compose run --rm backend alembic upgrade head`

4. **Optional: Seed Users**
    Seed initial Administrators and roles:
    `docker compose run --rm backend python -m app.seed`

## Running Locally (Without Docker)
Ensure PostgeSQL, Python 3.11+, and Node 20+ are running on your host machine.

### Backend Setup
1. Create a `ebi_vila_paula` database in Postgres. 
    `CREATE USER ebi_user WITH PASSWORD 'ebi_pass';`
    `CREATE DATABASE ebi_vila_paula OWNER ebi_user;`
2. Prepare the `backend/.venv` using `pip install -r requirements.txt`.
3. Set `DB_HOST=localhost` in your `.env`.
4. Run migrations locally pointing to your db.
    `PYTHONPATH=backend alembic -c backend/alembic.ini upgrade head`
5. Boot uvicorn.
    `PYTHONPATH=backend uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

### Frontend Setup
1. From `frontend/` run `npm install`.
2. Ensure `.env` is properly configuring `VITE_API_URL`.
3. Boot `npm run dev`.
