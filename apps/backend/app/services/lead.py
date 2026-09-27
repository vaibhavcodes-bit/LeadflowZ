from uuid import UUID

from sqlalchemy.orm import Session

from app.models.lead import Lead
from app.repositories.lead import (
    create_lead,
    get_lead,
    get_leads,
    update_lead,
)


def create_lead_service(
    db: Session,
    *,
    name: str,
    external_lead_id: str | None = None,
    email: str | None = None,
    phone: str | None = None,
    status: str = "new",
    source: str | None = None,
    notes: str | None = None,
) -> Lead:
    return create_lead(
        db,
        name=name,
        external_lead_id=external_lead_id,
        email=email,
        phone=phone,
        status=status,
        source=source,
        notes=notes,
    )


def get_lead_service(
    db: Session,
    lead_id: UUID,
) -> Lead | None:
    return get_lead(db, lead_id)


def get_leads_service(
    db: Session,
) -> list[Lead]:
    return get_leads(db)


def update_lead_service(
    db: Session,
    lead: Lead,
    *,
    name: str | None = None,
    email: str | None = None,
    phone: str | None = None,
    source: str | None = None,
    notes: str | None = None,
) -> Lead:
    return update_lead(
        db,
        lead,
        name=name,
        email=email,
        phone=phone,
        source=source,
        notes=notes,
    )


def update_lead_status_service(
    db: Session,
    lead: Lead,
    *,
    status: str,
) -> Lead:
    return update_lead(
        db,
        lead,
        status=status,
    )