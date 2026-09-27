from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    id: UUID
    lead_id: UUID
    event_type: str
    description: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)