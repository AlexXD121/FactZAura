import type { Incident } from "../types";
import { IncidentCard } from "./IncidentCard";
import { AgentLog } from "./AgentLog";
import { Loader2 } from "lucide-react";

interface FeedLayoutProps {
    incidents: Incident[];
    onIncidentSelect: (id: string) => void;
    selectedId: string | null;
    isLoading: boolean;
}

export function FeedLayout({ incidents, onIncidentSelect, selectedId, isLoading }: FeedLayoutProps) {
    // Sort incidents: CRITICAL first, then by date
    const sortedIncidents = [...incidents].sort((a, b) => {
        if (a.severity === b.severity) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.severity === "CRITICAL" ? -1 : 1;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-100">Crisis Monitor</h2>
                <div className="text-sm text-slate-400">
                    {incidents.length} Active Incidents
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Incident Feed - Takes up 2 columns on large screens */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sortedIncidents.map((incident) => (
                            <IncidentCard
                                key={incident.id}
                                incident={incident}
                                onSelect={onIncidentSelect}
                                isSelected={selectedId === incident.id}
                            />
                        ))}
                    </div>
                    {incidents.length === 0 && (
                        <div className="text-center py-12 text-slate-500 glass-panel">
                            No active incidents found.
                        </div>
                    )}
                </div>

                {/* Sidebar - Agent Activity Log */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6">
                        <AgentLog />
                    </div>
                </div>
            </div>
        </div>
    );
}
