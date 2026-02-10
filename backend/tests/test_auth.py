from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_login_invalid():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "nope@example.com", "password": "invalidpass"},
    )
    assert response.status_code in [401, 422]
