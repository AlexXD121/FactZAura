from prisma import Prisma
from services.connection_manager import manager
from typing import Dict, Any, List, Optional
from Levenshtein import ratio

class PostService:
    def __init__(self):
        self.db = Prisma()

    async def connect(self):
        if not self.db.is_connected():
            await self.db.connect()

    async def disconnect(self):
        if self.db.is_connected():
            await self.db.disconnect()

    def calculate_mutation_score(self, parent_content: str, child_content: str) -> float:
        """
        Calculates mutation score based on Levenshtein ratio.
        Score = (1 - ratio) * 100.
        0 = Identical, 100 = Completely different.
        """
        if not parent_content or not child_content:
            return 100.0
        
        similarity = ratio(parent_content, child_content)
        return (1.0 - similarity) * 100.0

    async def create_post(self, data: Dict[str, Any]) -> dict:
        await self.connect()
        
        # Calculate mutation score if parent exists
        mutation_score = 0.0
        mutation_type = None
        
        if data.get("parentId"):
            parent = await self.db.post.find_unique(where={"id": data["parentId"]})
            if parent:
                mutation_score = self.calculate_mutation_score(parent.content, data["content"])
                # Simple heuristic for mutation type
                if mutation_score < 10:
                    mutation_type = "FACTUAL" # Minor changes
                elif mutation_score < 40:
                    mutation_type = "EMOTIONAL" # Moderate changes
                else:
                    mutation_type = "FABRICATION" # Major changes
        
        # Create post
        post = await self.db.post.create(
            data={
                "id": data.get("id"), # Optional, let DB generate if None
                "content": data["content"],
                "author": data["author"],
                "incidentId": data["incidentId"],
                "parentId": data.get("parentId"),
                "timestamp": data.get("timestamp"), # Optional
                "mutationScore": mutation_score,
                "mutationType": mutation_type
            }
        )

        # Broadcast update via WebSocket
        await manager.broadcast(
            {
                "type": "new_post",
                "payload": post.dict()
            },
            data["incidentId"]
        )

        return post

    async def get_posts_by_incident(self, incident_id: str) -> List[dict]:
        await self.connect()
        return await self.db.post.find_many(
            where={"incidentId": incident_id},
            order={"timestamp": "asc"}
        )

    async def get_post_by_id(self, post_id: str) -> Optional[dict]:
        await self.connect()
        return await self.db.post.find_unique(where={"id": post_id})

    async def get_post_diff(self, post_id: str) -> Dict[str, Any]:
        await self.connect()
        post = await self.db.post.find_unique(where={"id": post_id})
        if not post:
            return None
        
        result = {
            "post": post,
            "parent": None,
            "diff": []
        }

        if post.parentId:
            parent = await self.db.post.find_unique(where={"id": post.parentId})
            if parent:
                result["parent"] = parent
                # Generate diff
                import difflib
                matcher = difflib.SequenceMatcher(None, parent.content, post.content)
                # We return opcodes: tag, i1, i2, j1, j2
                # tag: 'replace', 'delete', 'insert', 'equal'
                result["diff"] = matcher.get_opcodes()
        
        return result

    async def vote_on_post(self, post_id: str, is_credible: bool) -> Optional[dict]:
        """
        Vote on a post's credibility.
        Updates credibleVotes and totalVotes.
        """
        await self.connect()
        
        post = await self.db.post.find_unique(where={"id": post_id})
        if not post:
            return None
        
        # Update vote counts
        new_credible_votes = post.credibleVotes + (1 if is_credible else 0)
        new_total_votes = post.totalVotes + 1
        
        updated_post = await self.db.post.update(
            where={"id": post_id},
            data={
                "credibleVotes": new_credible_votes,
                "totalVotes": new_total_votes
            }
        )
        
        # Broadcast update via WebSocket
        await manager.broadcast(
            {
                "type": "post_voted",
                "payload": updated_post.dict()
            },
            updated_post.incidentId
        )
        
        return updated_post

    async def get_comments(self, post_id: str) -> List[dict]:
        """
        Get all comments for a post.
        """
        await self.connect()
        
        comments = await self.db.comment.find_many(
            where={"postId": post_id},
            order={"createdAt": "desc"}
        )
        
        return comments

    async def create_comment(self, post_id: str, data: Dict[str, Any]) -> dict:
        """
        Create a new comment on a post.
        """
        await self.connect()
        
        comment = await self.db.comment.create(
            data={
                "postId": post_id,
                "author": data["author"],
                "content": data["content"]
            }
        )
        
        # Get the post to find incident ID for broadcasting
        post = await self.db.post.find_unique(where={"id": post_id})
        
        # Broadcast update via WebSocket
        if post:
            await manager.broadcast(
                {
                    "type": "new_comment",
                    "payload": {
                        "comment": comment.dict(),
                        "postId": post_id
                    }
                },
                post.incidentId
            )
        
        return comment
