from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from services.post_service import PostService
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["posts"])
service = PostService()

class PostCreate(BaseModel):
    content: str
    author: str
    incidentId: str
    parentId: str | None = None

@router.on_event("startup")
async def startup():
    await service.connect()

@router.on_event("shutdown")
async def shutdown():
    await service.disconnect()

@router.get("/incidents/{incident_id}/posts")
async def get_incident_posts(incident_id: str):
    return await service.get_posts_by_incident(incident_id)

@router.post("/posts")
async def create_post(post: PostCreate):
    return await service.create_post(post.dict())

@router.get("/posts/{post_id}")
async def get_post(post_id: str):
    post = await service.get_post_by_id(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.get("/posts/{post_id}/diff")
async def get_post_diff(post_id: str):
    diff_data = await service.get_post_diff(post_id)
    if not diff_data:
        raise HTTPException(status_code=404, detail="Post not found")
    return diff_data
