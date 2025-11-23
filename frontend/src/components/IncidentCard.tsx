import { motion } from "framer-motion";
import { Activity, AlertTriangle, MapPin, Shield, ShieldAlert } from "lucide-react";
import type { Incident } from "../types";
import { cn } from "../lib/utils";

interface IncidentCardProps {
    incident: Incident;
    onSelect: (id: string) => void;
    isSelected: boolean;
}

export function IncidentCard({ incident, onSelect, isSelected }: IncidentCardProps) {
    const isCritical = incident.severity === "CRITICAL";

    return (
        <motion.div
            layoutId={`incident-${incident.id}`}
            onClick={() => onSelect(incident.id)}
            className={cn(
                "glass-panel p-6 cursor-pointer transition-all duration-300 relative overflow-hidden group",
                isSelected ? "ring-2 ring-offset-2 ring-offset-slate-900" : "hover:bg-white/5",
                isCritical
                    ? "border-l-4 border-l-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                    : "border-l-4 border-l-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]",
                isSelected && isCritical && "ring-red-500",
                isSelected && !isCritical && "ring-emerald-500"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Background Gradient Effect */}
            <div
                className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500",
                    isCritical ? "bg-gradient-to-br from-red-500/20 to-transparent" : "bg-gradient-to-br from-emerald-500/20 to-transparent"
                )}
            />

            <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                            {incident.title}
                            {isCritical && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <MapPin className="w-3 h-3" />
                            <span>{incident.location}</span>
                        </div>
                    </div>

                    <div className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                        isCritical ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    )}>
                        {isCritical ? <ShieldAlert className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        {incident.severity}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            Infected Nodes
                        </div>
                        <div className="text-lg font-semibold text-slate-200">
                            {/* Placeholder for live stats */}
                            {Math.floor(Math.random() * 50) + 10}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Mutation Rate
                        </div>
                        <div className={cn(
                            "text-lg font-semibold",
                            isCritical ? "text-red-400" : "text-emerald-400"
                        )}>
                            {/* Placeholder for live stats */}
                            {(Math.random() * 5).toFixed(1)}%
                        </div>
                    </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs text-slate-500">
                    <span>Status: {incident.status}</span>
                    <span>{new Date(incident.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </motion.div>
    );
}
