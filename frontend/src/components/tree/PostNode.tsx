import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { Post } from '../../types';
import { AlertTriangle, CheckCircle, Info, Flag } from 'lucide-react';

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

    // Calculate credibility percentage
    const credibilityScore = post.totalVotes > 0 
        ? (post.credibleVotes / post.totalVotes) * 100 
        : null;
    
    // Flag posts with <20% credibility
    const isLowCredibility = credibilityScore !== null && credibilityScore < 20;

    return (
        <div className={`glass-panel glass-panel-hover p-3 min-w-[250px] max-w-[300px] border-l-4 ${borderColor} shadow-lg relative group`}>
            <Handle type="target" position={Position.Top} className="!bg-slate-500" />

            {isLowCredibility && (
                <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-lg animate-pulse">
                    <Flag className="w-3 h-3 text-white" />
                </div>
            )}
            
            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/10 group-hover:to-cyan-500/10 transition-all duration-300 pointer-events-none" />

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

            {credibilityScore !== null && (
                <div className="mt-2 pt-2 border-t border-slate-700">
                    <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Credibility</span>
                        <span className={`font-bold ${
                            credibilityScore >= 60 ? 'text-green-400' : 
                            credibilityScore >= 20 ? 'text-yellow-400' : 
                            'text-red-400'
                        }`}>
                            {credibilityScore.toFixed(0)}%
                        </span>
                    </div>
                </div>
            )}

            <Handle type="source" position={Position.Bottom} className="!bg-slate-500" />
        </div>
    );
});
