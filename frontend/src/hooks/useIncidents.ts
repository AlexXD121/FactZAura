import { useQuery } from "@tanstack/react-query";
import { fetchIncidents } from "../lib/api";
import type { Incident } from "../types";

export function useIncidents() {
    return useQuery<Incident[]>({
        queryKey: ["incidents"],
        queryFn: fetchIncidents,
        refetchInterval: 3000, // Poll every 3 seconds
    });
}
