from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from services.incident_service import IncidentService
from models.incident import IncidentCreate, IncidentUpdate, IncidentResponse

router = APIRouter(prefix="/api/incidents", tags=["incidents"])
service = IncidentService()

@router.on_event("startup")
async def startup():
    await service.connect()

@router.on_event("shutdown")
async def shutdown():
    await service.disconnect()

@router.get("/", response_model=List[IncidentResponse])
async def get_incidents(severity: Optional[str] = Query(None)):
    return await service.get_all_incidents(severity_filter=severity)

@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: str):
    incident = await service.get_incident_by_id(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.post("/", response_model=IncidentResponse)
async def create_incident(incident: IncidentCreate):
    return await service.create_incident(incident)

@router.patch("/{incident_id}", response_model=IncidentResponse)
async def update_incident(incident_id: str, incident: IncidentUpdate):
    updated = await service.update_incident(incident_id, incident)
    if not updated:
        raise HTTPException(status_code=404, detail="Incident not found")
    return updated
