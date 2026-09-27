from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_create_lead() -> None:
    response = client.post(
        "/api/leads",
        json={
            "name": "API Test Lead",
            "email": "api@test.com",
            "phone": "9999999999",
            "source": "test",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "API Test Lead"
    assert data["email"] == "api@test.com"
    assert data["phone"] == "9999999999"
    assert data["source"] == "test"
    assert data["status"] == "new"

    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_list_leads() -> None:
    response = client.get("/api/leads")

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)


def test_get_lead() -> None:
    create_response = client.post(
        "/api/leads",
        json={
            "name": "Get Lead Test",
            "email": "get@test.com",
            "phone": "8888888888",
            "source": "test",
        },
    )

    assert create_response.status_code == 201

    lead_id = create_response.json()["id"]

    response = client.get(f"/api/leads/{lead_id}")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == lead_id
    assert data["name"] == "Get Lead Test"


def test_update_lead() -> None:
    create_response = client.post(
        "/api/leads",
        json={
            "name": "Before Update",
            "email": "before@test.com",
            "phone": "7777777777",
            "source": "test",
        },
    )

    assert create_response.status_code == 201

    lead_id = create_response.json()["id"]

    response = client.patch(
        f"/api/leads/{lead_id}",
        json={
            "name": "After Update",
            "email": "after@test.com",
            "phone": "6666666666",
            "source": "updated-test",
            "notes": "Updated through API",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == lead_id
    assert data["name"] == "After Update"
    assert data["email"] == "after@test.com"
    assert data["phone"] == "6666666666"
    assert data["source"] == "updated-test"
    assert data["notes"] == "Updated through API"


def test_update_lead_status() -> None:
    create_response = client.post(
        "/api/leads",
        json={
            "name": "Status Test Lead",
            "email": "status@test.com",
            "phone": "5555555555",
            "source": "test",
        },
    )

    assert create_response.status_code == 201

    lead_id = create_response.json()["id"]

    response = client.patch(
        f"/api/leads/{lead_id}/status",
        json={
            "status": "qualified",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == lead_id
    assert data["status"] == "qualified"


def test_get_nonexistent_lead() -> None:
    lead_id = uuid4()

    response = client.get(f"/api/leads/{lead_id}")

    assert response.status_code == 404

    data = response.json()

    assert data["detail"] == "Lead not found"


def test_update_nonexistent_lead() -> None:
    lead_id = uuid4()

    response = client.patch(
        f"/api/leads/{lead_id}",
        json={
            "name": "Does Not Exist",
        },
    )

    assert response.status_code == 404

    data = response.json()

    assert data["detail"] == "Lead not found"


def test_update_nonexistent_lead_status() -> None:
    lead_id = uuid4()

    response = client.patch(
        f"/api/leads/{lead_id}/status",
        json={
            "status": "qualified",
        },
    )

    assert response.status_code == 404

    data = response.json()

    assert data["detail"] == "Lead not found"