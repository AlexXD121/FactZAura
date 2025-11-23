from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.connection_manager import manager

router = APIRouter(prefix="/api/ws", tags=["websockets"])

@router.websocket("/incidents/{incident_id}")
async def websocket_endpoint(websocket: WebSocket, incident_id: str):
    await manager.connect(websocket, incident_id)
    try:
        while True:
            # Keep connection alive and listen for any client messages (optional)
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, incident_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, incident_id)
