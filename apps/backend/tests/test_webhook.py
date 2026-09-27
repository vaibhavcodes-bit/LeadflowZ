from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_meta_webhook_creates_lead():
    payload = {
        "external_lead_id": "meta-test-001",
        "name": "Meta Test User",
        "email": "meta@example.com",
        "phone": "+919999999999",
        "source": "meta",
        "notes": "Test lead",
    }

    response = client.post(
        "/api/webhook/meta-lead",
        json=payload,
    )

    assert response.status_code == 201

    data = response.json()

    assert data["external_lead_id"] == "meta-test-001"
    assert data["name"] == "Meta Test User"
    assert data["email"] == "meta@example.com"
    assert data["source"] == "meta"


def test_meta_webhook_does_not_create_duplicate():
    payload = {
        "external_lead_id": "meta-test-duplicate-001",
        "name": "Duplicate Test User",
        "email": "duplicate@example.com",
        "source": "meta",
    }

    first_response = client.post(
        "/api/webhook/meta-lead",
        json=payload,
    )

    second_response = client.post(
        "/api/webhook/meta-lead",
        json=payload,
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 201

    first_data = first_response.json()
    second_data = second_response.json()

    assert first_data["id"] == second_data["id"]
    assert (
        first_data["external_lead_id"]
        == second_data["external_lead_id"]
    )