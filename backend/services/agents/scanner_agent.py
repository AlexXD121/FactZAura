import json
import os
from typing import List, Optional, Dict, Any
from prisma import Prisma
from services.incident_service import IncidentService
from models.incident import IncidentCreate

class ScannerAgent:
    def __init__(self, data_path: str = "data/simulation_data.json"):
        self.data_path = data_path
        self.incidents: List[Dict[str, Any]] = []
        self.posts: List[Dict[str, Any]] = []
        self.current_post_index = 0
        self.MAX_POSTS_LIMIT = 100
        self.db = Prisma()
        self.incident_service = IncidentService()
        self._load_data()

    def _load_data(self):
        # Resolve absolute path relative to backend root if needed
        if not os.path.isabs(self.data_path):
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            self.data_path = os.path.join(base_dir, self.data_path)

        try:
            with open(self.data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.incidents = data.get("incidents", [])
                self.posts = data.get("posts", [])
        except FileNotFoundError:
            print(f"Warning: Simulation data file not found at {self.data_path}")
            self.incidents = []
            self.posts = []

    async def process_post_db(self, post_data: Dict[str, Any]):
        """
        Ensures the incident and post exist in the database.
        """
        if not self.db.is_connected():
            await self.db.connect()

        # 1. Check/Create Incident
        incident_id = post_data.get("incident_id")
        if incident_id:
            incident_data = next((inc for inc in self.incidents if inc["id"] == incident_id), None)
            if incident_data:
                existing_incident = await self.db.incident.find_unique(where={"id": incident_id})
                if not existing_incident:
                    # Create incident
                    await self.db.incident.create(
                        data={
                            "id": incident_data["id"],
                            "title": incident_data["title"],
                            "severity": incident_data["severity"],
                            "location": incident_data["location"],
                            "status": incident_data["status"]
                        }
                    )

        # 2. Check/Create Post
        post_id = post_data.get("id")
        existing_post = await self.db.post.find_unique(where={"id": post_id})
        if not existing_post:
            # Handle parent relationship
            parent_id = post_data.get("parent_id")
            
            # Ensure parent exists if specified (simple check, assuming order is correct in json)
            if parent_id:
                parent_exists = await self.db.post.find_unique(where={"id": parent_id})
                if not parent_exists:
                    print(f"Warning: Parent {parent_id} not found for post {post_id}. Skipping parent link.")
                    parent_id = None

            await self.db.post.create(
                data={
                    "id": post_id,
                    "content": post_data["content"],
                    "author": post_data["author"],
                    "incidentId": incident_id,
                    "parentId": parent_id,
                    "timestamp": post_data["timestamp"]
                    # mutationScore/Type will be updated by Publisher/Verifier later
                }
            )

    def get_incidents(self) -> List[Dict[str, Any]]:
        return self.incidents

    def get_next_post(self) -> Optional[Dict[str, Any]]:
        if self.current_post_index >= len(self.posts):
            return None
        
        if self.current_post_index >= self.MAX_POSTS_LIMIT:
            return None

        post = self.posts[self.current_post_index]
        self.current_post_index += 1
        return post

    def reset(self):
        self.current_post_index = 0
