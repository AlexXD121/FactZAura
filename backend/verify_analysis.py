import asyncio
import os
from prisma import Prisma
from app.services.analysis_service import AnalysisService

async def main():
    db = Prisma()
    await db.connect()
    
    service = AnalysisService(db)
    
    print("--- Testing Analysis Service ---")
    
    # 1. Test Gemini API Integration
    print("\n1. Testing Gemini API (analyze_new_content)...")
    try:
        result = await service.analyze_new_content("There is a massive flood in Mumbai right now, verify this!")
        print("Result:", result)
        if result.get("risk_level") in ["LOW", "MEDIUM", "HIGH"]:
            print("[PASS] Gemini API test passed.")
        else:
            print("[FAIL] Gemini API test failed (unexpected format).")
    except Exception as e:
        print(f"[FAIL] Gemini API test failed with error: {e}")

    # 2. Test Fuzzy Matching (requires data)
    print("\n2. Testing Fuzzy Matching (find_similar_posts)...")
    
    incident = None
    post = None
    
    try:
        # Create a dummy incident first (required for post)
        incident = await db.incident.create(
            data={
                "title": "Dummy Incident for Testing",
                "severity": "WARNING",
                "location": "Test Location",
                "status": "ACTIVE"
            }
        )
        print(f"Created dummy incident: {incident.id}")

        # Create a dummy post
        post = await db.post.create(
            data={
                "content": "The Mumbai floods are causing severe traffic delays.",
                "incidentId": incident.id,
                "author": "TestBot"
            }
        )
        print(f"Created dummy post: {post.id}")
        
        matches = await service.find_similar_posts("Mumbai floods causing traffic", threshold=0.5)
        print(f"Found {len(matches)} matches.")
        
        match_found = False
        for m in matches:
            if m["post"].id == post.id:
                print(f"Match found! Similarity: {m['similarity']}")
                match_found = True
                break
        
        if match_found:
            print("[PASS] Fuzzy matching test passed.")
        else:
            print("[FAIL] Fuzzy matching test failed (target post not found in matches).")
            
    except Exception as e:
        print(f"[FAIL] Fuzzy matching test failed with error: {e}")
    finally:
        # Cleanup
        if post:
            await db.post.delete(where={"id": post.id})
            print("Cleaned up dummy post.")
        if incident:
            await db.incident.delete(where={"id": incident.id})
            print("Cleaned up dummy incident.")

    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
