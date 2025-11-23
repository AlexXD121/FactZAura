from fastapi import WebSocket
from typing import List, Dict

class ConnectionManager:
    def __init__(self):
        # Map incident_id to list of active WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, incident_id: str):
        await websocket.accept()
        if incident_id not in self.active_connections:
            self.active_connections[incident_id] = []
        self.active_connections[incident_id].append(websocket)

    def disconnect(self, websocket: WebSocket, incident_id: str):
        if incident_id in self.active_connections:
            if websocket in self.active_connections[incident_id]:
                self.active_connections[incident_id].remove(websocket)
            if not self.active_connections[incident_id]:
                del self.active_connections[incident_id]

    async def broadcast(self, message: dict, incident_id: str):
        if incident_id in self.active_connections:
            for connection in self.active_connections[incident_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error broadcasting to {incident_id}: {e}")
                    # Cleanup might be needed here in a robust system

manager = ConnectionManager()
