import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface RelatedPost {
    id: string;
    title: string;
    similarity: number;
}

export interface TruthScorecard {
    match_percentage: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
    related_posts: RelatedPost[];
    analysis: string;
}

export const analyzeContent = async (content: string): Promise<TruthScorecard> => {
    const response = await axios.post(`${API_BASE_URL}/analyze`, { content });
    return response.data;
};
