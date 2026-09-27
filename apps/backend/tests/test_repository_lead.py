from sqlalchemy import delete

from app.db.session import SessionLocal
from app.models.lead import Lead
from app.repositories.lead import (
    create_lead,
    get_lead,
    get_leads,
    update_lead,
)


def test_lead_repository_crud() -> None:
    db = SessionLocal()

    lead = None

    try:
        lead = create_lead(
            db,
            name="Repository Test Lead",
            email="repository@test.com",
            phone="9999999999",
            source="test",
        )

        assert lead.id is not None
        assert lead.name == "Repository Test Lead"
        assert lead.status == "new"

        fetched = get_lead(db, lead.id)

        assert fetched is not None
        assert fetched.id == lead.id
        assert fetched.email == "repository@test.com"

        leads = get_leads(db)

        assert any(item.id == lead.id for item in leads)

        updated = update_lead(
            db,
            lead,
            status="contacted",
            notes="Updated by repository test",
        )

        assert updated.status == "contacted"
        assert updated.notes == "Updated by repository test"

    finally:
        if lead is not None:
            db.execute(
                delete(Lead).where(Lead.id == lead.id)
            )
            db.commit()

        db.close()