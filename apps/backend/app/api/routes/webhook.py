from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.schemas.webhook import MetaLeadWebhook
from app.services.lead import create_lead_service


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
):
    return create_lead_service(
        db,
        external_lead_id=payload.external_lead_id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        source=payload.source,
        notes=payload.notes,
    )