from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


# Allowed lead pipeline statuses
LeadStatus = Literal[
    "new",
    "contacted",
    "qualified",
    "converted",
    "lost",
]


class LeadCreate(BaseModel):
    external_lead_id: str | None = None
    name: str
    email: str | None = None
    phone: str | None = None
    status: LeadStatus = "new"
    source: str | None = None
    notes: str | None = None


class LeadUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    source: str | None = None
    notes: str | None = None


class LeadStatusUpdate(BaseModel):
    status: LeadStatus


class LeadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    external_lead_id: str | None
    name: str
    email: str | None
    phone: str | None
    status: LeadStatus
    source: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime