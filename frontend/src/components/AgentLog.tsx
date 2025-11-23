import { useRef } from 'react';
import { useAgentActivity, type AgentLogEntry } from '../hooks/useAgentActivity';
import { Terminal, Activity, Shield, Radio } from 'lucide-react';

export function AgentLog() {
    const { logs } = useAgentActivity();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to top (since we prepend new logs) or keep static?
    // Actually, for a "log" view, usually newest is at bottom or top.
    // Let's put newest at top for visibility in a dashboard widget.

    const getAgentIcon = (agent: AgentLogEntry['agent']) => {
        switch (agent) {
            case 'SCANNER': return <Radio className="w-4 h-4 text-blue-400" />;
            case 'VERIFIER': return <Shield className="w-4 h-4 text-purple-400" />;
            case 'PUBLISHER': return <Activity className="w-4 h-4 text-emerald-400" />;
            default: return <Terminal className="w-4 h-4 text-slate-400" />;
        }
    };

    const getAgentColor = (agent: AgentLogEntry['agent']) => {
        switch (agent) {
            case 'SCANNER': return 'text-blue-400';
            case 'VERIFIER': return 'text-purple-400';
            case 'PUBLISHER': return 'text-emerald-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="glass-panel p-4 h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-2">
                <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-slate-300" />
                    <h3 className="font-semibold text-slate-200">Agent Activity</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs text-emerald-400 font-mono">LIVE</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar" ref={scrollRef}>
                {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 text-sm animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="mt-0.5 opacity-80">
                            {getAgentIcon(log.agent)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={`font-mono font-bold text-xs ${getAgentColor(log.agent)}`}>
                                    {log.agent}
                                </span>
                                <span className="text-slate-500 text-xs">
                                    {log.timestamp.toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="text-slate-300 truncate">
                                <span className="font-semibold">{log.action}:</span> {log.details}
                            </div>
                        </div>
                    </div>
                ))}

                {logs.length === 0 && (
                    <div className="text-center text-slate-600 py-8 italic">
                        Initializing agents...
                    </div>
                )}
            </div>
        </div>
    );
}
