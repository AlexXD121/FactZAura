import requests
import json

def test_analysis_api():
    url = "http://localhost:8000/api/analyze"
    payload = {
        "content": "Mumbai floods are causing massive traffic jams near Dadar."
    }
    headers = {
        "Content-Type": "application/json"
    }

    print(f"Sending POST request to {url}...")
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Response JSON:")
            print(json.dumps(data, indent=2))
            
            if "match_percentage" in data and "risk_level" in data:
                print("[PASS] API returned valid TruthScorecard structure.")
            else:
                print("[FAIL] API response missing required fields.")
        else:
            print(f"[FAIL] API request failed: {response.text}")
            
    except Exception as e:
        print(f"[FAIL] Request failed with error: {e}")
        print("Make sure the backend server is running!")

if __name__ == "__main__":
    test_analysis_api()
