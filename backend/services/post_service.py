from prisma import Prisma
from services.connection_manager import manager

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
