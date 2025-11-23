from typing import Dict, Any
from prisma import Prisma

class PublisherAgent:
    def __init__(self):
        self.db = Prisma()

    async def publish(self, result: Dict[str, Any]):
        """
        Publishes the verification result by updating the post in the database.
        """
        post_id = result.get("post_id")
        status = result.get("truth_status")
        explanation = result.get("explanation")
        
        mutation_score = result.get("mutation_score")
        mutation_type = result.get("mutation_type")
        
        print(f"[PublisherAgent] Published Truth Scorecard for Post {post_id}: {status}")
        
        if not self.db.is_connected():
            await self.db.connect()

        # Update the post with verification results
        try:
            await self.db.post.update(
                where={"id": post_id},
                data={
                    "mutationScore": mutation_score,
                    "mutationType": mutation_type
                    # Note: 'truth_status' is not in schema, so we rely on mutationScore/Type
                    # to indicate verification status to the frontend.
                }
            )
        except Exception as e:
            print(f"[PublisherAgent] Error updating DB for post {post_id}: {e}")
