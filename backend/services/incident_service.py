from prisma import Prisma
from typing import List, Optional
from models.incident import IncidentCreate, IncidentUpdate

class IncidentService:
    def __init__(self):
        self.db = Prisma()

    async def connect(self):
        if not self.db.is_connected():
            await self.db.connect()

    async def disconnect(self):
        if self.db.is_connected():
            await self.db.disconnect()

    async def get_all_incidents(self, severity_filter: Optional[str] = None) -> List[dict]:
        await self.connect()
        where_clause = {}
        if severity_filter:
            where_clause["severity"] = severity_filter

        # Sort by severity (CRITICAL first) then by creation date (newest first)
        # Prisma doesn't support custom sort order easily in one query for enums usually,
        # but we can fetch and sort in python or rely on simple sorting.
        # For now, let's just sort by createdAt desc.
        # Requirement says: "sort by severity with Critical Incidents appearing first"
        
        incidents = await self.db.incident.find_many(
            where=where_clause,
            order={
                "createdAt": "desc"
            }
        )
        
        # In-memory sort for severity to ensure CRITICAL is first
        # This is acceptable for expected dataset size
        sorted_incidents = sorted(
            incidents,
            key=lambda x: 0 if x.severity == "CRITICAL" else 1
        )
        
        return sorted_incidents

    async def get_incident_by_id(self, incident_id: str) -> Optional[dict]:
        await self.connect()
        return await self.db.incident.find_unique(where={"id": incident_id})

    async def create_incident(self, data: IncidentCreate) -> dict:
        await self.connect()
        return await self.db.incident.create(
            data={
                "title": data.title,
                "severity": data.severity,
                "location": data.location,
                "status": data.status
            }
        )

    async def update_incident(self, incident_id: str, data: IncidentUpdate) -> Optional[dict]:
        await self.connect()
        update_data = {k: v for k, v in data.dict().items() if v is not None}
        if not update_data:
            return await self.get_incident_by_id(incident_id)
            
        return await self.db.incident.update(
            where={"id": incident_id},
            data=update_data
        )
