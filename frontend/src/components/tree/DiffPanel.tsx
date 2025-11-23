import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { fetchPostDiff } from '../../lib/api';
import type { Post } from '../../types';

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

    useEffect(() => {
        if (selectedPostId) {
            setIsLoading(true);
            fetchPostDiff(selectedPostId)
                .then(setData)
                .catch(console.error)
                .finally(() => setIsLoading(false));
        } else {
            setData(null);
        }
    }, [selectedPostId]);

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
                            renderDiff()
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
