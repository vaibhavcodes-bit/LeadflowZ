from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.schemas.webhook import MetaLeadWebhook
from app.services.lead import (
    create_lead_service,
    get_lead_by_external_id_service,
)
from app.core.config import get_settings


settings = get_settings()

router = APIRouter(
    prefix="/webhook",
    tags=["webhook"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post(
    "/meta-lead",
    status_code=status.HTTP_201_CREATED,
)
def receive_meta_lead(
    payload: MetaLeadWebhook,
    db: Session = Depends(get_db),
    x_webhook_secret: str | None = Header(default=None),
):
    if x_webhook_secret != settings.webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook secret",
        )

    existing_lead = get_lead_by_external_id_service(
        db,
        payload.external_lead_id,
    )

    if existing_lead is not None:
        return existing_lead

    return create_lead_service(
        db,
        external_lead_id=payload.external_lead_id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        source=payload.source,
        notes=payload.notes,
    )