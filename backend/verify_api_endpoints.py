import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def test_endpoint(name, url, method="GET", expected_status=200):
    print(f"\nTesting {name} ({method} {url})...")
    try:
        if method == "GET":
            response = requests.get(url)
        
        if response.status_code == expected_status:
            print(f"[PASS] {name} returned {response.status_code}")
            try:
                data = response.json()
                print(f"Response sample: {json.dumps(data, indent=2)[:200]}...")
                return data
            except:
                print("Response is not JSON")
                return None
        else:
            print(f"[FAIL] {name} returned {response.status_code} (Expected {expected_status})")
            print(response.text)
            return None
    except Exception as e:
        print(f"[ERROR] {e}")
        return None

def main():
    print("--- Verifying Additional API Endpoints ---")
    
    # 1. Get Incidents
    incidents = test_endpoint("Get Incidents", f"{BASE_URL}/incidents")
    
    if incidents and len(incidents) > 0:
        incident_id = incidents[0]['id']
        print(f"Found incident ID: {incident_id}")
        
        # 2. Get Posts for Incident
        posts = test_endpoint("Get Incident Posts", f"{BASE_URL}/incidents/{incident_id}/posts")
        
        if posts and len(posts) > 0:
            post_id = posts[0]['id']
            print(f"Found post ID: {post_id}")
            
            # 3. Get Single Post
            test_endpoint("Get Single Post", f"{BASE_URL}/posts/{post_id}")
            
            # 4. Get Post Diff (if implemented)
            # test_endpoint("Get Post Diff", f"{BASE_URL}/posts/{post_id}/diff")
        else:
            print("[WARNING] No posts found for incident.")
            
    else:
        print("[WARNING] No incidents found. Seeding might be needed.")

if __name__ == "__main__":
    main()
