import type { Incident } from "../types";

const API_BASE_URL = "http://localhost:8000/api";

export async function fetchIncidents(): Promise<Incident[]> {
    const response = await fetch(`${API_BASE_URL}/incidents`);
    if (!response.ok) {
        throw new Error("Failed to fetch incidents");
    }
    return response.json();
}

export async function fetchIncidentById(id: string): Promise<Incident> {
    const response = await fetch(`${API_BASE_URL}/incidents/${id}`);
    if (!response.ok) {
        throw new Error("Failed to fetch incident");
    }
    return response.json();
}

export async function fetchPostsByIncident(incidentId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/incidents/${incidentId}/posts`);
    if (!response.ok) {
        throw new Error("Failed to fetch posts");
    }
    return response.json();
}

export async function fetchPostDiff(postId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/diff`);
    if (!response.ok) {
        throw new Error("Failed to fetch post diff");
    }
    return response.json();
}
