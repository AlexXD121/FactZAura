from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    WARNING = "WARNING"

class IncidentBase(BaseModel):
    title: str
    severity: Severity
    location: str
    status: str

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    severity: Optional[Severity] = None
    location: Optional[str] = None
    status: Optional[str] = None

class IncidentResponse(IncidentBase):
    id: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True
