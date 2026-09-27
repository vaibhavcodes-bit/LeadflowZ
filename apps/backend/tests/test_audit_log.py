from uuid import UUID

from app.db.session import SessionLocal
from app.repositories.audit_log import get_audit_logs_by_lead


def test_lead_creation_creates_audit_log() -> None:
    from fastapi.testclient import TestClient

    from app.main import app

    client = TestClient(app)

    response = client.post(
        "/api/leads",
        json={
            "name": "Audit Test Lead",
            "email": "audit@test.com",
            "phone": "9999999999",
            "source": "audit-test",
        },
    )

    assert response.status_code == 201

    lead_id = UUID(response.json()["id"])

    db = SessionLocal()

    try:
        audit_logs = get_audit_logs_by_lead(
            db,
            lead_id,
        )

        assert len(audit_logs) == 1

        audit_log = audit_logs[0]

        assert audit_log.lead_id == lead_id
        assert audit_log.event_type == "lead_created"
        assert audit_log.description == "Lead created"

    finally:
        db.close()



def test_lead_update_creates_audit_log() -> None:
    from fastapi.testclient import TestClient

    from app.main import app

    client = TestClient(app)

    create_response = client.post(
        "/api/leads",
        json={
            "name": "Audit Update Lead",
            "email": "audit-update@test.com",
            "phone": "8888888888",
            "source": "audit-test",
        },
    )

    assert create_response.status_code == 201

    lead_id = UUID(create_response.json()["id"])

    update_response = client.patch(
        f"/api/leads/{lead_id}",
        json={
            "name": "Updated Audit Lead",
            "email": "updated@test.com",
            "phone": "7777777777",
            "source": "updated-audit-test",
            "notes": "Updated for audit test",
        },
    )

    assert update_response.status_code == 200

    db = SessionLocal()

    try:
        audit_logs = get_audit_logs_by_lead(
            db,
            lead_id,
        )

        assert len(audit_logs) == 2

        assert audit_logs[0].event_type == "lead_created"
        assert audit_logs[0].description == "Lead created"

        assert audit_logs[1].event_type == "lead_updated"
        assert audit_logs[1].description == "Lead updated"

    finally:
        db.close()


def test_lead_status_change_creates_audit_log() -> None:
    from fastapi.testclient import TestClient

    from app.main import app

    client = TestClient(app)

    response = client.post(
        "/api/leads",
        json={
            "name": "Audit Status Test Lead",
            "email": "audit-status@test.com",
            "phone": "8888888888",
            "source": "audit-test",
        },
    )

    assert response.status_code == 201

    lead_id = UUID(response.json()["id"])

    response = client.patch(
        f"/api/leads/{lead_id}/status",
        json={
            "status": "qualified",
        },
    )

    assert response.status_code == 200

    db = SessionLocal()

    try:
        audit_logs = get_audit_logs_by_lead(
            db,
            lead_id,
        )

        assert len(audit_logs) == 2

        assert audit_logs[0].event_type == "lead_created"

        assert audit_logs[1].event_type == "lead_status_changed"
        assert (
            audit_logs[1].description
            == "Lead status changed from new to qualified"
        )

    finally:
        db.close()



def test_get_lead_audit_logs() -> None:
    from fastapi.testclient import TestClient

    from app.main import app

    client = TestClient(app)

    response = client.post(
        "/api/leads",
        json={
            "name": "Audit History Test Lead",
            "email": "audit-history@test.com",
            "phone": "7777777777",
            "source": "audit-test",
        },
    )

    assert response.status_code == 201

    lead_id = response.json()["id"]

    response = client.patch(
        f"/api/leads/{lead_id}",
        json={
            "name": "Updated Audit History Lead",
        },
    )

    assert response.status_code == 200

    response = client.patch(
        f"/api/leads/{lead_id}/status",
        json={
            "status": "qualified",
        },
    )

    assert response.status_code == 200

    response = client.get(
        f"/api/leads/{lead_id}/audit-logs"
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 3

    assert data[0]["event_type"] == "lead_created"

    assert data[1]["event_type"] == "lead_updated"

    assert data[2]["event_type"] == "lead_status_changed"

    assert data[0]["lead_id"] == lead_id
    assert data[1]["lead_id"] == lead_id
    assert data[2]["lead_id"] == lead_id