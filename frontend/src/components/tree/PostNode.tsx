import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { Post } from '../../types';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface PostNodeProps {
    data: {
        post: Post;
        borderColor: string;
    };
}

export const PostNode = memo(({ data }: PostNodeProps) => {
    const { post, borderColor } = data;

    const getIcon = () => {
        if (post.mutationScore && post.mutationScore >= 40) return <AlertTriangle className="w-4 h-4 text-red-400" />;
        if (post.mutationScore && post.mutationScore >= 10) return <Info className="w-4 h-4 text-yellow-400" />;
        return <CheckCircle className="w-4 h-4 text-green-400" />;
    };

    return (
        <div className={`glass-panel p-3 min-w-[250px] max-w-[300px] border-l-4 ${borderColor} shadow-lg`}>
            <Handle type="target" position={Position.Top} className="!bg-slate-500" />

            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-400">{post.author}</span>
                <div className="flex items-center gap-1">
                    {getIcon()}
                    <span className="text-xs font-bold text-slate-300">
                        {post.mutationScore?.toFixed(1)}%
                    </span>
                </div>
            </div>

            <p className="text-sm text-slate-200 line-clamp-3 mb-2">
                {post.content}
            </p>

            <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>{new Date(post.timestamp).toLocaleTimeString()}</span>
                <span className="uppercase">{post.mutationType || 'ORIGINAL'}</span>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-slate-500" />
        </div>
    );
});
