from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from prisma import Prisma
from services.analysis_service import AnalysisService

router = APIRouter()

class AnalysisRequest(BaseModel):
    content: str

class RelatedPost(BaseModel):
    id: str
    title: str
    similarity: float

class TruthScorecard(BaseModel):
    match_percentage: int
    risk_level: str
    related_posts: List[RelatedPost]
    analysis: str

async def get_db():
    db = Prisma()
    await db.connect()
    try:
        yield db
    finally:
        await db.disconnect()

@router.post("/api/analyze", response_model=TruthScorecard)
async def analyze_content(request: AnalysisRequest):
    db = Prisma()
    await db.connect()
    try:
        service = AnalysisService(db)
        result = await service.generate_truth_scorecard(request.content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await db.disconnect()
