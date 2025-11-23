export interface Incident {
    id: string;
    title: string;
    severity: 'CRITICAL' | 'WARNING';
    location: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface Post {
    id: string;
    content: string;
    author: string;
    timestamp: string;
    incidentId: string;
    parentId?: string;
    mutationScore?: number;
    mutationType?: 'EMOTIONAL' | 'FACTUAL' | 'FABRICATION';
    credibleVotes: number;
    totalVotes: number;
}

export interface Comment {
    id: string;
    postId: string;
    author: string;
    content: string;
    createdAt: string;
}

export interface AnalysisResult {
    matchFound: boolean;
    matchPercentage: number;
    relatedPosts: Post[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    summary: string;
}
