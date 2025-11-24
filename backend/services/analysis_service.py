import os
import Levenshtein
import google.generativeai as genai
from typing import List, Optional, Dict, Any
from prisma import Prisma
from prisma.models import Post

class AnalysisService:
    def __init__(self, db: Prisma):
        self.db = db
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash')
        else:
            print("WARNING: GEMINI_API_KEY not found in environment variables.")
            self.model = None

    async def find_similar_posts(self, content: str, threshold: float = 0.8) -> List[Dict[str, Any]]:
        """
        Finds posts in the database that are similar to the given content using Levenshtein distance.
        Returns a list of dictionaries containing the post and the similarity score.
        """
        # In a real production app with millions of posts, we would use a vector database (e.g., pgvector, Pinecone).
        # For this hackathon/demo, fetching all posts and computing distance in-memory is acceptable for small datasets.
        all_posts = await self.db.post.find_many()
        
        matches = []
        for post in all_posts:
            similarity = Levenshtein.ratio(content, post.content)
            if similarity >= threshold:
                matches.append({
                    "post": post,
                    "similarity": similarity
                })
        
        # Sort by similarity (highest first)
        matches.sort(key=lambda x: x["similarity"], reverse=True)
        return matches

    async def analyze_new_content(self, content: str) -> Dict[str, Any]:
        """
        Uses Gemini API to analyze content for potential misinformation and risk.
        """
        if not self.model:
            return {
                "risk_level": "UNKNOWN",
                "confidence": 0.0,
                "analysis": "AI service unavailable. Please check API configuration."
            }

        prompt = f"""
        Analyze the following social media post or news snippet for potential misinformation, alarmism, or risk to public order.
        
        Content: "{content}"
        
        Provide the output in the following JSON format ONLY (no markdown code blocks):
        {{
            "risk_level": "LOW" | "MEDIUM" | "HIGH",
            "confidence": <float between 0.0 and 1.0>,
            "analysis": "<brief explanation of why this risk level was assigned>"
        }}
        """

        try:
            response = await self.model.generate_content_async(prompt)
            # Simple cleanup to ensure we get valid JSON if the model wraps it in markdown
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:-3].strip()
            elif text.startswith("```"):
                text = text[3:-3].strip()
            
            import json
            return json.loads(text)
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return {
                "risk_level": "UNKNOWN",
                "confidence": 0.0,
                "analysis": f"Error during analysis: {str(e)}"
            }

    async def generate_truth_scorecard(self, content: str) -> Dict[str, Any]:
        """
        Orchestrates the verification process:
        1. Checks for similar existing posts (Known Misinformation).
        2. If no matches, analyzes content using AI.
        """
        # Step 1: Check for existing matches
        matches = await self.find_similar_posts(content, threshold=0.8)
        
        if matches:
            # Found known content
            top_match = matches[0]
            return {
                "match_percentage": int(top_match["similarity"] * 100),
                "risk_level": "HIGH" if top_match["similarity"] > 0.9 else "MEDIUM", # If it matches known misinformation, it's risky
                "related_posts": [
                    {
                        "id": m["post"].id,
                        "title": f"Post {m['post'].id[:8]}...", # Using ID as title substitute for now if title missing
                        "similarity": m["similarity"]
                    } for m in matches[:3]
                ],
                "analysis": "Matches existing content in our knowledge base."
            }
        
        # Step 2: Analyze new content
        ai_result = await self.analyze_new_content(content)
        
        return {
            "match_percentage": int(ai_result.get("confidence", 0) * 100),
            "risk_level": ai_result.get("risk_level", "UNKNOWN"),
            "related_posts": [],
            "analysis": ai_result.get("analysis", "No analysis available.")
        }
