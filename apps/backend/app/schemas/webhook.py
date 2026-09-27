from pydantic import BaseModel, EmailStr, Field


class MetaLeadWebhook(BaseModel):
    external_lead_id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    email: EmailStr | None = None
    phone: str | None = None
    source: str = "meta"
    notes: str | None = None