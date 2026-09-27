from uuid import UUID

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.repositories.audit_log import (
    create_audit_log,
    get_audit_logs_by_lead,
)


def create_audit_log_service(
    db: Session,
    *,
    lead_id: UUID,
    event_type: str,
    description: str | None = None,
) -> AuditLog:
    return create_audit_log(
        db,
        lead_id=lead_id,
        event_type=event_type,
        description=description,
    )


def get_audit_logs_by_lead_service(
    db: Session,
    lead_id: UUID,
) -> list[AuditLog]:
    return get_audit_logs_by_lead(
        db,
        lead_id,
    )