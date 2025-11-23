from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import incident_routes, agent_routes, post_routes, websocket_routes
from services.agent_manager import agent_manager

app = FastAPI(title="FactsAura API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"], # Allow frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
# Include Routers
app.include_router(incident_routes.router)
app.include_router(agent_routes.router)
app.include_router(post_routes.router)
app.include_router(websocket_routes.router)

@app.on_event("startup")
async def startup_event():
    # Start the autonomous agent loop
    await agent_manager.start()

@app.on_event("shutdown")
async def shutdown_event():
    await agent_manager.stop()

@app.get("/")
async def root():
    return {"message": "Welcome to FactsAura API"}
