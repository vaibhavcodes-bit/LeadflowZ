from uuid import UUID

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    *,
    lead_id: UUID,
    event_type: str,
    description: str | None = None,
) -> AuditLog:
    audit_log = AuditLog(
        lead_id=lead_id,
        event_type=event_type,
        description=description,
    )

    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)

    return audit_log


def get_audit_logs_by_lead(
    db: Session,
    lead_id: UUID,
) -> list[AuditLog]:
    return (
        db.query(AuditLog)
        .filter(AuditLog.lead_id == lead_id)
        .order_by(AuditLog.created_at.asc())
        .all()
    )