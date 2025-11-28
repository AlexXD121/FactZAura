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

class VoteRequest(BaseModel):
    isCredible: bool

class CommentCreate(BaseModel):
    author: str
    content: str

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

@router.post("/posts/{post_id}/vote")
async def vote_on_post(post_id: str, vote: VoteRequest):
    """
    Vote on a post's credibility.
    isCredible: true = credible vote, false = not credible vote
    """
    updated_post = await service.vote_on_post(post_id, vote.isCredible)
    if not updated_post:
        raise HTTPException(status_code=404, detail="Post not found")
    return updated_post

@router.get("/posts/{post_id}/comments")
async def get_post_comments(post_id: str):
    """
    Get all comments for a post.
    """
    return await service.get_comments(post_id)

@router.post("/posts/{post_id}/comments")
async def create_comment(post_id: str, comment: CommentCreate):
    """
    Create a new comment on a post.
    """
    # Verify post exists
    post = await service.get_post_by_id(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    new_comment = await service.create_comment(post_id, comment.dict())
    return new_comment
