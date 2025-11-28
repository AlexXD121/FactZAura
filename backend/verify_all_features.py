"""
Comprehensive End-to-End Verification Script
Tests all implemented features of FactSaura
"""
import asyncio
import requests
import json
from prisma import Prisma
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(name):
    print(f"\n{Colors.BLUE}[TEST]{Colors.END} {name}")

def print_pass(msg):
    print(f"{Colors.GREEN}✓ PASS:{Colors.END} {msg}")

def print_fail(msg):
    print(f"{Colors.RED}✗ FAIL:{Colors.END} {msg}")

def print_info(msg):
    print(f"{Colors.YELLOW}ℹ INFO:{Colors.END} {msg}")

async def verify_all_features():
    print(f"\n{'='*60}")
    print(f"{Colors.BLUE}FactSaura - Comprehensive Feature Verification{Colors.END}")
    print(f"{'='*60}")
    
    db = Prisma()
    await db.connect()
    
    incident = None
    post1 = None
    post2 = None
    comment = None
    
    try:
        # ===== FEATURE 1: Crisis Monitor Feed =====
        print_test("Feature 1: Crisis Monitor Feed")
        
        # Create test incident
        incident = await db.incident.create(
            data={
                "title": "Test Flood Incident",
                "severity": "CRITICAL",
                "location": "Test City",
                "status": "ACTIVE"
            }
        )
        print_pass(f"Created incident: {incident.id}")
        
        # Test GET /api/incidents
        response = requests.get(f"{BASE_URL}/incidents")
        if response.status_code == 200:
            incidents = response.json()
            if any(i["id"] == incident.id for i in incidents):
                print_pass("GET /api/incidents - Incident found in feed")
            else:
                print_fail("GET /api/incidents - Incident not found")
        else:
            print_fail(f"GET /api/incidents - Status {response.status_code}")
        
        # ===== FEATURE 2: Phylogenetic Tree =====
        print_test("Feature 2: Phylogenetic Tree Visualization")
        
        # Create parent post
        post1 = await db.post.create(
            data={
                "content": "The dam has cracked and water is flooding downtown.",
                "incidentId": incident.id,
                "author": "Observer1",
                "mutationScore": 0.0
            }
        )
        print_pass(f"Created parent post: {post1.id}")
        
        # Create child post with mutation
        post2 = await db.post.create(
            data={
                "content": "The dam has COLLAPSED and water is DESTROYING downtown!",
                "incidentId": incident.id,
                "author": "Observer2",
                "parentId": post1.id,
                "mutationScore": 35.5,
                "mutationType": "EMOTIONAL"
            }
        )
        print_pass(f"Created child post: {post2.id}")
        
        # Test GET /api/incidents/{id}/posts
        response = requests.get(f"{BASE_URL}/incidents/{incident.id}/posts")
        if response.status_code == 200:
            posts = response.json()
            if len(posts) >= 2:
                print_pass(f"GET /api/incidents/{{id}}/posts - Found {len(posts)} posts")
                
                # Verify parent-child relationship
                child = next((p for p in posts if p["id"] == post2.id), None)
                if child and child.get("parentId") == post1.id:
                    print_pass("Parent-child relationship verified")
                else:
                    print_fail("Parent-child relationship not found")
            else:
                print_fail("Not enough posts returned")
        else:
            print_fail(f"GET /api/incidents/{{id}}/posts - Status {response.status_code}")
        
        # Test GET /api/posts/{id}/diff
        response = requests.get(f"{BASE_URL}/posts/{post2.id}/diff")
        if response.status_code == 200:
            diff_data = response.json()
            if diff_data.get("parent") and diff_data.get("diff"):
                print_pass("GET /api/posts/{id}/diff - Diff data retrieved")
            else:
                print_fail("Diff data incomplete")
        else:
            print_fail(f"GET /api/posts/{{id}}/diff - Status {response.status_code}")
        
        # ===== FEATURE 3: Submission Portal =====
        print_test("Feature 3: Submission Portal")
        
        # Test known content
        response = requests.post(
            f"{BASE_URL}/analyze",
            json={"content": "The dam has cracked and water is flooding downtown."},
            timeout=10
        )
        if response.status_code == 200:
            result = response.json()
            if result.get("match_percentage", 0) > 70:
                print_pass(f"Known content detected - Match: {result['match_percentage']}%")
            else:
                print_fail(f"Known content not detected - Match: {result.get('match_percentage', 0)}%")
        else:
            print_fail(f"POST /api/analyze - Status {response.status_code}")
        
        # ===== FEATURE 4: Voting System =====
        print_test("Feature 4: Community Voting")
        
        # Test voting
        response = requests.post(
            f"{BASE_URL}/posts/{post1.id}/vote",
            json={"isCredible": True}
        )
        if response.status_code == 200:
            updated_post = response.json()
            if updated_post.get("credibleVotes") == 1 and updated_post.get("totalVotes") == 1:
                print_pass("POST /api/posts/{id}/vote - Vote recorded (credible)")
            else:
                print_fail("Vote counts incorrect")
        else:
            print_fail(f"POST /api/posts/{{id}}/vote - Status {response.status_code}")
        
        # Vote again (not credible)
        response = requests.post(
            f"{BASE_URL}/posts/{post1.id}/vote",
            json={"isCredible": False}
        )
        if response.status_code == 200:
            updated_post = response.json()
            if updated_post.get("totalVotes") == 2:
                credibility = (updated_post["credibleVotes"] / updated_post["totalVotes"]) * 100
                print_pass(f"Second vote recorded - Credibility: {credibility:.1f}%")
            else:
                print_fail("Second vote not recorded")
        else:
            print_fail(f"Second vote failed - Status {response.status_code}")
        
        # ===== FEATURE 5: Comments =====
        print_test("Feature 5: Community Comments")
        
        # Create comment
        response = requests.post(
            f"{BASE_URL}/posts/{post1.id}/comments",
            json={"author": "TestUser", "content": "This is a test comment with a link: https://example.com"}
        )
        if response.status_code == 200:
            comment = response.json()
            print_pass(f"POST /api/posts/{{id}}/comments - Comment created: {comment['id']}")
        else:
            print_fail(f"POST /api/posts/{{id}}/comments - Status {response.status_code}")
        
        # Get comments
        response = requests.get(f"{BASE_URL}/posts/{post1.id}/comments")
        if response.status_code == 200:
            comments = response.json()
            if len(comments) >= 1:
                print_pass(f"GET /api/posts/{{id}}/comments - Found {len(comments)} comment(s)")
            else:
                print_fail("No comments found")
        else:
            print_fail(f"GET /api/posts/{{id}}/comments - Status {response.status_code}")
        
        # ===== PROPERTY TESTS =====
        print_test("Property Tests Verification")
        
        # Check mutation score bounds
        all_posts = await db.post.find_many()
        mutation_scores_valid = all(
            p.mutationScore is None or (0.0 <= p.mutationScore <= 100.0)
            for p in all_posts
        )
        if mutation_scores_valid:
            print_pass("Property: Mutation scores within bounds [0, 100]")
        else:
            print_fail("Property: Mutation scores out of bounds")
        
        # Check temporal consistency
        if post2.timestamp >= post1.timestamp:
            print_pass("Property: Temporal consistency (child >= parent)")
        else:
            print_fail("Property: Temporal consistency violated")
        
        # ===== SUMMARY =====
        print(f"\n{'='*60}")
        print(f"{Colors.GREEN}Verification Complete!{Colors.END}")
        print(f"{'='*60}")
        print_info("All core features have been tested")
        print_info("Check output above for any failures")
        
    except Exception as e:
        print_fail(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Cleanup
        print(f"\n{Colors.YELLOW}[CLEANUP]{Colors.END} Removing test data...")
        try:
            if comment:
                await db.comment.delete(where={"id": comment["id"]})
            if post2:
                await db.post.delete(where={"id": post2.id})
            if post1:
                await db.post.delete(where={"id": post1.id})
            if incident:
                await db.incident.delete(where={"id": incident.id})
            print_pass("Cleanup complete")
        except Exception as e:
            print_fail(f"Cleanup error: {e}")
        
        await db.disconnect()

if __name__ == "__main__":
    print("\nStarting verification...")
    print("Make sure the backend server is running on http://localhost:8000")
    print("Press Ctrl+C to cancel\n")
    
    try:
        asyncio.run(verify_all_features())
    except KeyboardInterrupt:
        print("\n\nVerification cancelled by user")
    except Exception as e:
        print(f"\n\nFatal error: {e}")
