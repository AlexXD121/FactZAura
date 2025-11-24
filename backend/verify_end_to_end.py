import asyncio
import requests
import json
from prisma import Prisma

API_URL = "http://localhost:8000/api/analyze"

async def run_verification():
    print("--- Starting End-to-End Verification ---")
    
    db = Prisma()
    await db.connect()
    
    incident = None
    post = None
    
    try:
        # 1. Setup: Create Seed Data
        print("\n[SETUP] Creating seed data...")
        incident = await db.incident.create(
            data={
                "title": "E2E Test Incident",
                "severity": "WARNING",
                "location": "Test City",
                "status": "ACTIVE"
            }
        )
        
        post_content = "The dam has cracked and water is flooding the downtown area."
        post = await db.post.create(
            data={
                "content": post_content,
                "incidentId": incident.id,
                "author": "TestObserver"
            }
        )
        print(f"Created seed post: {post.id}")
        
        # 2. Test Scenario 1: Known Content (Fuzzy Match)
        print("\n[TEST 1] Known Content (Fuzzy Match)")
        query_text = "The dam cracked and water is flooding downtown." # Similar text
        print(f"Query: '{query_text}'")
        
        response = requests.post(API_URL, json={"content": query_text}, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("Response:", json.dumps(data, indent=2))
            
            match_pct = data.get("match_percentage", 0)
            related = data.get("related_posts", [])
            
            if match_pct > 80 and any(p["id"] == post.id for p in related):
                print("[PASS] Correctly identified known content.")
            else:
                print("[FAIL] Did not identify known content correctly.")
        else:
            print(f"[FAIL] API returned {response.status_code}")

        # 3. Test Scenario 2: New Content (AI Analysis)
        print("\n[TEST 2] New Content (AI Analysis)")
        new_text = "A giant meteor has been spotted approaching Earth."
        print(f"Query: '{new_text}'")
        
        response = requests.post(API_URL, json={"content": new_text}, timeout=30) # Longer timeout for AI
        
        if response.status_code == 200:
            data = response.json()
            print("Response:", json.dumps(data, indent=2))
            
            related = data.get("related_posts", [])
            
            if len(related) == 0:
                print("[PASS] Correctly treated as new content (no related posts).")
            else:
                print("[WARNING] Found related posts for new content (unexpected).")
                
            if data.get("risk_level") in ["LOW", "MEDIUM", "HIGH"]:
                 print("[PASS] AI assigned a risk level.")
            else:
                 print("[FAIL] Invalid risk level.")
        else:
            print(f"[FAIL] API returned {response.status_code}")

    except Exception as e:
        print(f"[ERROR] {e}")
    finally:
        # 4. Teardown
        print("\n[TEARDOWN] Cleaning up...")
        if post:
            await db.post.delete(where={"id": post.id})
        if incident:
            await db.incident.delete(where={"id": incident.id})
        await db.disconnect()
        print("Done.")

if __name__ == "__main__":
    asyncio.run(run_verification())
