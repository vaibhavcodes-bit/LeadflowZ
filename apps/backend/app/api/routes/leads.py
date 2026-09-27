from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.schemas.audit_log import AuditLogResponse
from app.schemas.lead import (
    LeadCreate,
    LeadResponse,
    LeadStatusUpdate,
    LeadUpdate,
)
from app.services.audit_log import get_audit_logs_by_lead_service
from app.services.lead import (
    create_lead_service,
    get_lead_service,
    get_leads_service,
    update_lead_service,
    update_lead_status_service,
)

router = APIRouter(
    prefix="/leads",
    tags=["leads"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post(
    "",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_lead(
    payload: LeadCreate,
    db: Session = Depends(get_db),
):
    return create_lead_service(
        db,
        name=payload.name,
        external_lead_id=payload.external_lead_id,
        email=payload.email,
        phone=payload.phone,
        status=payload.status,
        source=payload.source,
        notes=payload.notes,
    )


@router.get(
    "",
    response_model=list[LeadResponse],
)
def list_leads(
    db: Session = Depends(get_db),
):
    return get_leads_service(db)


@router.get(
    "/{lead_id}",
    response_model=LeadResponse,
)
def get_lead(
    lead_id: UUID,
    db: Session = Depends(get_db),
):
    lead = get_lead_service(db, lead_id)

    if lead is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found",
        )

    return lead


@router.patch(
    "/{lead_id}",
    response_model=LeadResponse,
)
def update_lead(
    lead_id: UUID,
    payload: LeadUpdate,
    db: Session = Depends(get_db),
):
    lead = get_lead_service(db, lead_id)

    if lead is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found",
        )

    return update_lead_service(
        db,
        lead,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        source=payload.source,
        notes=payload.notes,
    )


@router.patch(
    "/{lead_id}/status",
    response_model=LeadResponse,
)
def update_lead_status(
    lead_id: UUID,
    payload: LeadStatusUpdate,
    db: Session = Depends(get_db),
):
    lead = get_lead_service(db, lead_id)

    if lead is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found",
        )

    return update_lead_status_service(
        db,
        lead,
        status=payload.status,
    )


@router.get(
    "/{lead_id}/audit-logs",
    response_model=list[AuditLogResponse],
)
def get_lead_audit_logs(
    lead_id: UUID,
    db: Session = Depends(get_db),
):
    lead = get_lead_service(db, lead_id)

    if lead is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found",
        )

    return get_audit_logs_by_lead_service(
        db,
        lead_id,
    )