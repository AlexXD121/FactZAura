import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPostsByIncident } from '../lib/api';
import type { Post } from '../types';

export function useIncidentSocket(incidentId: string | null) {
    const queryClient = useQueryClient();
    const [socket, setSocket] = useState<WebSocket | null>(null);

    // Initial fetch
    const { data: posts = [], isLoading } = useQuery({
        queryKey: ['posts', incidentId],
        queryFn: () => incidentId ? fetchPostsByIncident(incidentId) : Promise.resolve([]),
        enabled: !!incidentId,
    });

    useEffect(() => {
        if (!incidentId) return;

        const ws = new WebSocket(`ws://localhost:8000/api/ws/incidents/${incidentId}`);

        ws.onopen = () => {
            console.log('Connected to incident socket');
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'new_post') {
                const newPost = message.payload;
                queryClient.setQueryData(['posts', incidentId], (oldPosts: Post[] = []) => {
                    // Avoid duplicates
                    if (oldPosts.find(p => p.id === newPost.id)) return oldPosts;
                    return [...oldPosts, newPost];
                });
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from incident socket');
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, [incidentId, queryClient]);

    return { posts, isLoading, socket };
}
