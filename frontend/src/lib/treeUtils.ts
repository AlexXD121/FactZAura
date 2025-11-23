import dagre from 'dagre';
import { type Node, type Edge, Position } from 'reactflow';
import type { Post } from '../types';

const nodeWidth = 300;
const nodeHeight = 150;

export const getLayoutedElements = (posts: Post[], direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: direction });

    // Create Nodes
    posts.forEach((post) => {
        dagreGraph.setNode(post.id, { width: nodeWidth, height: nodeHeight });
    });

    // Create Edges
    const edges: Edge[] = [];
    posts.forEach((post) => {
        if (post.parentId) {
            // Determine edge color based on mutation score
            let strokeColor = '#22c55e'; // Green (< 10)
            if (post.mutationScore && post.mutationScore >= 40) {
                strokeColor = '#ef4444'; // Red (>= 40)
            } else if (post.mutationScore && post.mutationScore >= 10) {
                strokeColor = '#eab308'; // Yellow (10-40)
            }

            edges.push({
                id: `${post.parentId}-${post.id}`,
                source: post.parentId,
                target: post.id,
                type: 'smoothstep',
                style: { stroke: strokeColor, strokeWidth: 2 },
                animated: true,
            });

            dagreGraph.setEdge(post.parentId, post.id);
        }
    });

    dagre.layout(dagreGraph);

    const nodes: Node[] = posts.map((post) => {
        const nodeWithPosition = dagreGraph.node(post.id);

        // Determine border color based on mutation/truth
        // This logic can be refined or moved to the node component
        let borderColor = 'border-slate-700';
        if (post.mutationScore && post.mutationScore >= 40) borderColor = 'border-red-500';
        else if (post.mutationScore && post.mutationScore >= 10) borderColor = 'border-yellow-500';
        else if (post.mutationScore !== null) borderColor = 'border-green-500';

        return {
            id: post.id,
            type: 'postNode',
            targetPosition: Position.Top,
            sourcePosition: Position.Bottom,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
            data: {
                post,
                borderColor
            },
        };
    });

    return { nodes, edges };
};
