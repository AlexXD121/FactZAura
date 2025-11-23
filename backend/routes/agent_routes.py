from fastapi import APIRouter
from services.agent_manager import agent_manager

router = APIRouter(prefix="/api/agent", tags=["agent"])

@router.get("/logs")
async def get_agent_logs():
    return agent_manager.get_logs()

@router.post("/start")
async def start_agent_loop():
    await agent_manager.start()
    return {"status": "started"}

@router.post("/stop")
async def stop_agent_loop():
    await agent_manager.stop()
    return {"status": "stopped"}
