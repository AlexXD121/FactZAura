import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ThumbsUp, ThumbsDown, Flag } from 'lucide-react';
import { fetchPostDiff, voteOnPost } from '../../lib/api';
import type { Post } from '../../types';
import { CommentSection } from '../CommentSection';

interface DiffPanelProps {
    selectedPostId: string | null;
    onClose: () => void;
}

interface DiffData {
    post: Post;
    parent: Post | null;
    diff: [string, number, number, number, number][]; // opcodes
}

export function DiffPanel({ selectedPostId, onClose }: DiffPanelProps) {
    const [data, setData] = useState<DiffData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        if (selectedPostId) {
            setIsLoading(true);
            setHasVoted(false);
            fetchPostDiff(selectedPostId)
                .then(setData)
                .catch(console.error)
                .finally(() => setIsLoading(false));
        } else {
            setData(null);
        }
    }, [selectedPostId]);

    const handleVote = async (isCredible: boolean) => {
        if (!selectedPostId || hasVoted) return;
        
        try {
            const updatedPost = await voteOnPost(selectedPostId, isCredible);
            setData((prev: DiffData | null) => prev ? { ...prev, post: updatedPost } : null);
            setHasVoted(true);
        } catch (error) {
            console.error('Failed to vote:', error);
        }
    };

    const renderDiff = () => {
        if (!data || !data.parent) return <p className="text-slate-300">{data?.post.content}</p>;

        const { post, parent, diff } = data;

        // We render the child content, highlighting changes
        // This is a simplified view. For a full diff, we might want to show both sides or a unified view.
        // Let's show a unified view where deletions are red and insertions are green.

        // Actually, let's show Parent -> Child transition

        return (
            <div className="space-y-4">
                <div className="p-3 bg-slate-900/50 rounded border border-slate-700">
                    <h4 className="text-xs font-bold text-slate-400 mb-1">PARENT</h4>
                    <p className="text-sm text-slate-300">{parent.content}</p>
                </div>

                <div className="flex justify-center">
                    <ArrowRight className="text-slate-500" />
                </div>

                <div className="p-3 bg-slate-900/50 rounded border border-slate-700">
                    <h4 className="text-xs font-bold text-slate-400 mb-1">CHILD (Mutation: {post.mutationScore?.toFixed(1)}%)</h4>
                    <div className="text-sm text-slate-300">
                        {diff.map(([tag, i1, i2, j1, j2], idx) => {
                            const parentPart = parent.content.slice(i1, i2);
                            const childPart = post.content.slice(j1, j2);

                            if (tag === 'equal') {
                                return <span key={idx}>{childPart}</span>;
                            } else if (tag === 'replace') {
                                return (
                                    <span key={idx}>
                                        <span className="bg-red-900/50 text-red-200 line-through mx-1">{parentPart}</span>
                                        <span className="bg-green-900/50 text-green-200">{childPart}</span>
                                    </span>
                                );
                            } else if (tag === 'delete') {
                                return <span key={idx} className="bg-red-900/50 text-red-200 line-through mx-1">{parentPart}</span>;
                            } else if (tag === 'insert') {
                                return <span key={idx} className="bg-green-900/50 text-green-200">{childPart}</span>;
                            }
                            return null;
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AnimatePresence>
            {selectedPostId && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute top-0 right-0 w-96 h-full bg-slate-900/95 backdrop-blur-md border-l border-slate-700 shadow-2xl z-20 overflow-y-auto"
                >
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-100">Mutation Analysis</h3>
                            <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="text-slate-500 text-center py-8">Analyzing mutation...</div>
                        ) : (
                            <>
                                {renderDiff()}

                                {data && (
                                    <div className="mt-6 space-y-4">
                                        {/* Credibility Score Display */}
                                        <div className="p-4 bg-slate-900/50 rounded border border-slate-700">
                                            <h4 className="text-xs font-bold text-slate-400 mb-3">COMMUNITY CREDIBILITY</h4>
                                            {data.post.totalVotes > 0 ? (
                                                <>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm text-slate-300">Credibility Score</span>
                                                        <span className={`text-2xl font-bold ${
                                                            (data.post.credibleVotes / data.post.totalVotes) * 100 >= 60 ? 'text-green-400' :
                                                            (data.post.credibleVotes / data.post.totalVotes) * 100 >= 20 ? 'text-yellow-400' :
                                                            'text-red-400'
                                                        }`}>
                                                            {((data.post.credibleVotes / data.post.totalVotes) * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {data.post.credibleVotes} credible / {data.post.totalVotes} total votes
                                                    </div>
                                                    {(data.post.credibleVotes / data.post.totalVotes) * 100 < 20 && (
                                                        <div className="mt-3 flex items-center gap-2 p-2 bg-red-900/20 border border-red-800 rounded">
                                                            <Flag className="w-4 h-4 text-red-400" />
                                                            <span className="text-xs text-red-200">
                                                                Low credibility - Community flagged as potentially unreliable
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-sm text-slate-500">No votes yet. Be the first to vote!</div>
                                            )}
                                        </div>

                                        {/* Voting Controls */}
                                        <div className="p-4 bg-slate-900/50 rounded border border-slate-700">
                                            <h4 className="text-xs font-bold text-slate-400 mb-3">VOTE ON CREDIBILITY</h4>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleVote(true)}
                                                    disabled={hasVoted}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all transform ${
                                                        hasVoted
                                                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                                            : 'bg-green-900/30 hover:bg-green-900/50 text-green-300 border border-green-800 hover:border-green-600 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-green-500/20'
                                                    }`}
                                                >
                                                    <ThumbsUp className="w-5 h-5" />
                                                    <span>Credible</span>
                                                </button>
                                                <button
                                                    onClick={() => handleVote(false)}
                                                    disabled={hasVoted}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all transform ${
                                                        hasVoted
                                                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                                            : 'bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-800 hover:border-red-600 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-red-500/20'
                                                    }`}
                                                >
                                                    <ThumbsDown className="w-5 h-5" />
                                                    <span>Not Credible</span>
                                                </button>
                                            </div>
                                            {hasVoted && (
                                                <div 
                                                    className="mt-3 text-xs text-center text-emerald-400 animate-in fade-in slide-in-from-bottom-2 duration-500"
                                                >
                                                    ✓ Vote recorded! Thank you for your contribution.
                                                </div>
                                            )}
                                        </div>

                                        {/* Comment Section */}
                                        <CommentSection postId={selectedPostId} />
                                    </div>
                                )}
                            </>
                        )}

                        {data && !data.parent && (
                            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded text-sm text-blue-200">
                                This is the <strong>Patient Zero</strong> (Root Post). No parent to compare against.
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
