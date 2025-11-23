import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    type Node,
    type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PostNode } from './PostNode';
import { getLayoutedElements } from '../../lib/treeUtils';
import { DiffPanel } from './DiffPanel';
import type { Post } from '../../types';

const nodeTypes: NodeTypes = {
    postNode: PostNode,
};

interface TreeVisualizationProps {
    posts: Post[];
    isLoading: boolean;
}

export function TreeVisualization({ posts, isLoading }: TreeVisualizationProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    // Recalculate layout when posts change
    useMemo(() => {
        if (posts.length === 0) return;
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(posts);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [posts, setNodes, setEdges]);

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedPostId(node.id);
    }, []);

    if (isLoading) {
        return (
            <div className="h-[600px] w-full bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-center">
                <div className="text-emerald-400 animate-pulse">Loading phylogenetic tree...</div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="h-[600px] w-full bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-center">
                <div className="text-slate-500">No data available for this incident.</div>
            </div>
        );
    }

    return (
        <div className="h-[600px] w-full bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color="#334155" gap={16} />
                <Controls className="bg-slate-800 border-slate-700 fill-slate-400" />
                <MiniMap
                    nodeColor={() => {
                        return '#10b981'; // Simplified for minimap
                    }}
                    className="bg-slate-800 border-slate-700"
                />
            </ReactFlow>

            <DiffPanel
                selectedPostId={selectedPostId}
                onClose={() => setSelectedPostId(null)}
            />

            <div className="absolute top-4 left-4 z-10 bg-slate-900/80 p-2 rounded border border-slate-700">
                <h3 className="text-sm font-bold text-slate-200">Phylogenetic Tree</h3>
                <div className="flex gap-4 mt-2 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-slate-400">Verified</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span className="text-slate-400">Modified</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-slate-400">Fabricated</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
