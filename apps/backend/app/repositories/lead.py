from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.lead import Lead


def create_lead(
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
    lead = Lead(
        external_lead_id=external_lead_id,
        name=name,
        email=email,
        phone=phone,
        status=status,
        source=source,
        notes=notes,
    )

    db.add(lead)
    db.commit()
    db.refresh(lead)

    return lead


def get_lead(
    db: Session,
    lead_id: UUID,
) -> Lead | None:
    statement = select(Lead).where(Lead.id == lead_id)

    return db.scalar(statement)


def get_leads(
    db: Session,
) -> list[Lead]:
    statement = select(Lead).order_by(Lead.created_at.desc())

    return list(db.scalars(statement).all())


def update_lead(
    db: Session,
    lead: Lead,
    *,
    name: str | None = None,
    email: str | None = None,
    phone: str | None = None,
    status: str | None = None,
    source: str | None = None,
    notes: str | None = None,
) -> Lead:
    if name is not None:
        lead.name = name

    if email is not None:
        lead.email = email

    if phone is not None:
        lead.phone = phone

    if status is not None:
        lead.status = status

    if source is not None:
        lead.source = source

    if notes is not None:
        lead.notes = notes

    db.commit()
    db.refresh(lead)

    return lead