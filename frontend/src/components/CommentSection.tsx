import { useState, useEffect } from 'react';
import { MessageSquare, Send, ExternalLink } from 'lucide-react';
import type { Comment } from '../types';
import { fetchComments as fetchCommentsAPI, createComment } from '../lib/api';

interface CommentSectionProps {
    postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadComments();
        
        // Poll for new comments every 3 seconds
        const interval = setInterval(() => {
            loadComments();
        }, 3000);

        return () => clearInterval(interval);
    }, [postId]);

    const loadComments = async () => {
        setIsLoading(true);
        try {
            const data = await fetchCommentsAPI(postId);
            // Sort by newest first
            const sorted = data.sort((a: Comment, b: Comment) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setComments(sorted);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const newCommentData = await createComment(postId, 'Anonymous User', newComment.trim());
            setComments([newCommentData, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderCommentContent = (content: string) => {
        // Simple URL detection and rendering as clickable links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = content.split(urlRegex);

        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
                    >
                        {part}
                        <ExternalLink className="w-3 h-3" />
                    </a>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <div className="p-4 bg-slate-900/50 rounded border border-slate-700 glass-panel">
            <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-400">
                    COMMUNITY DISCUSSION ({comments.length})
                </h4>
            </div>

            {/* Comment Input Form */}
            <form onSubmit={handleSubmit} className="mb-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        disabled={isSubmitting}
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmitting}
                        className="px-4 py-2 bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800 hover:border-emerald-600 rounded font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105 active:scale-95"
                    >
                        <Send className={`w-4 h-4 ${isSubmitting ? 'animate-pulse' : ''}`} />
                        <span className="hidden sm:inline">{isSubmitting ? 'Posting...' : 'Post'}</span>
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
                {isLoading ? (
                    <div className="text-center text-slate-500 text-sm py-4 animate-pulse">
                        Loading comments...
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-slate-500 text-sm py-4">
                        No comments yet. Be the first to comment!
                    </div>
                ) : (
                    comments.map((comment, index) => (
                        <div
                            key={comment.id}
                            className="p-3 bg-slate-800/50 rounded border border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600/50 transition-all duration-200"
                            style={{
                                animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                            }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-slate-400">
                                    {comment.author}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    {new Date(comment.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm text-slate-300 break-words">
                                {renderCommentContent(comment.content)}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
