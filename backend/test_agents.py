import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.agents.scanner_agent import ScannerAgent
from services.agents.verifier_agent import VerifierAgent
from services.agents.publisher_agent import PublisherAgent

async def main():
    print("Initializing Agents...")
    scanner = ScannerAgent(data_path="data/simulation_data.json")
    verifier = VerifierAgent()
    publisher = PublisherAgent()

    print(f"Scanner initialized. Incidents found: {len(scanner.get_incidents())}")
    
    count = 0
    while True:
        post = scanner.get_next_post()
        if not post:
            print("No more posts to scan.")
            break
        
        count += 1
        print(f"\nProcessing Post #{count}: {post['id']}")
        
        # Verify
        verification_result = await verifier.verify(post)
        
        # Publish
        await publisher.publish(verification_result)

    print(f"\nTotal posts processed: {count}")
    if count <= 100:
        print("SUCCESS: Post limit respected.")
    else:
        print("FAILURE: Post limit exceeded.")

if __name__ == "__main__":
    asyncio.run(main())
