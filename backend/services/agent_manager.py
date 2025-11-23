import asyncio
from typing import List, Dict, Any
from datetime import datetime
from services.agents.scanner_agent import ScannerAgent
from services.agents.verifier_agent import VerifierAgent
from services.agents.publisher_agent import PublisherAgent

class AgentManager:
    def __init__(self):
        self.scanner = ScannerAgent()
        self.verifier = VerifierAgent()
        self.publisher = PublisherAgent()
        self.is_running = False
        self.logs: List[Dict[str, Any]] = []
        self.MAX_LOGS = 50
        self._task = None

    def add_log(self, agent: str, action: str, details: str):
        log_entry = {
            "id": datetime.now().isoformat(),
            "agent": agent,
            "action": action,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.logs.insert(0, log_entry)
        if len(self.logs) > self.MAX_LOGS:
            self.logs.pop()
        print(f"[{agent}] {action}: {details}")

    async def start(self):
        if self.is_running:
            return
        self.is_running = True
        self._task = asyncio.create_task(self._run_loop())
        self.add_log("SYSTEM", "Started", "Autonomous Agent Loop started.")

    async def stop(self):
        self.is_running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        self.add_log("SYSTEM", "Stopped", "Autonomous Agent Loop stopped.")

    async def _run_loop(self):
        while self.is_running:
            try:
                # 1. Scan
                post = self.scanner.get_next_post()
                if post:
                    self.add_log("SCANNER", "Detected", f"New content: {post.get('id')}")
                    
                    # Ensure incident and post exist in DB (ScannerAgent logic update needed)
                    await self.scanner.process_post_db(post) 

                    # 2. Verify
                    self.add_log("VERIFIER", "Analyzing", f"Verifying {post.get('id')}...")
                    verification_result = await self.verifier.verify(post)
                    
                    # 3. Publish
                    self.add_log("PUBLISHER", "Publishing", f"Result for {post.get('id')}: {verification_result.get('truth_status')}")
                    await self.publisher.publish(verification_result)
                else:
                    # No new posts, wait a bit
                    await asyncio.sleep(2)
                
                await asyncio.sleep(1) # Pace the loop
            except Exception as e:
                self.add_log("SYSTEM", "Error", str(e))
                await asyncio.sleep(5)

    def get_logs(self) -> List[Dict[str, Any]]:
        return self.logs

# Global instance
agent_manager = AgentManager()
