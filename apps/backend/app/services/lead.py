from uuid import UUID

from sqlalchemy.orm import Session

from app.models.lead import Lead
from app.repositories.lead import (
    create_lead,
    get_lead,
    get_lead_by_external_id,
    get_leads,
    update_lead,
)
from app.services.audit_log import create_audit_log_service


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
    lead = create_lead(
        db,
        name=name,
        external_lead_id=external_lead_id,
        email=email,
        phone=phone,
        status=status,
        source=source,
        notes=notes,
    )

    create_audit_log_service(
        db,
        lead_id=lead.id,
        event_type="lead_created",
        description="Lead created",
    )

    return lead


def get_lead_service(
    db: Session,
    lead_id: UUID,
) -> Lead | None:
    return get_lead(db, lead_id)


def get_leads_service(
    db: Session,
) -> list[Lead]:
    return get_leads(db)


def get_lead_by_external_id_service(
    db: Session,
    external_lead_id: str,
) -> Lead | None:
    return get_lead_by_external_id(
        db,
        external_lead_id,
    )


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
    updated_lead = update_lead(
        db,
        lead,
        name=name,
        email=email,
        phone=phone,
        source=source,
        notes=notes,
    )

    create_audit_log_service(
        db,
        lead_id=updated_lead.id,
        event_type="lead_updated",
        description="Lead updated",
    )

    return updated_lead


def update_lead_status_service(
    db: Session,
    lead: Lead,
    *,
    status: str,
) -> Lead:
    old_status = lead.status

    updated_lead = update_lead(
        db,
        lead,
        status=status,
    )

    create_audit_log_service(
        db,
        lead_id=lead.id,
        event_type="lead_status_changed",
        description=f"Lead status changed from {old_status} to {status}",
    )

    return updated_lead