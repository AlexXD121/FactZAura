import { useState, useEffect } from 'react';

export interface AgentLogEntry {
    id: string;
    agent: 'SCANNER' | 'VERIFIER' | 'PUBLISHER';
    action: string;
    details: string;
    timestamp: Date;
}

export function useAgentActivity() {
    const [logs, setLogs] = useState<AgentLogEntry[]>([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/agent/logs');
                if (response.ok) {
                    const data = await response.json();
                    // Parse timestamp strings into Date objects
                    const parsedData = data.map((log: any) => ({
                        ...log,
                        timestamp: new Date(log.timestamp)
                    }));
                    setLogs(parsedData);
                }
            } catch (error) {
                console.error("Failed to fetch agent logs:", error);
            }
        };

        // Initial fetch
        fetchLogs();

        // Poll every 2 seconds
        const interval = setInterval(fetchLogs, 2000);

        return () => clearInterval(interval);
    }, []);

    return { logs };
}
