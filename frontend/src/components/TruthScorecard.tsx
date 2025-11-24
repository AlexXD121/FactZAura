import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, ExternalLink, Shield } from 'lucide-react';

interface RelatedPost {
    id: string;
    title: string;
    similarity: number;
}

interface TruthScorecardProps {
    matchPercentage: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    relatedPosts: RelatedPost[];
    onReset: () => void;
}

export const TruthScorecard: React.FC<TruthScorecardProps> = ({
    matchPercentage,
    riskLevel,
    relatedPosts,
    onReset
}) => {
    const getRiskColor = (level: string) => {
        switch (level) {
            case 'LOW': return 'text-emerald-400 border-emerald-500/50 bg-emerald-950/30';
            case 'MEDIUM': return 'text-yellow-400 border-yellow-500/50 bg-yellow-950/30';
            case 'HIGH': return 'text-red-400 border-red-500/50 bg-red-950/30';
            default: return 'text-gray-400 border-gray-500/50 bg-gray-950/30';
        }
    };

    const getRiskIcon = (level: string) => {
        switch (level) {
            case 'LOW': return <CheckCircle className="w-12 h-12 text-emerald-400" />;
            case 'MEDIUM': return <AlertTriangle className="w-12 h-12 text-yellow-400" />;
            case 'HIGH': return <XCircle className="w-12 h-12 text-red-400" />;
            default: return <Shield className="w-12 h-12 text-gray-400" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-black/40 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-2xl"
        >
            {/* Header */}
            <div className={`p-6 border-b border-white/10 flex items-center justify-between ${getRiskColor(riskLevel).split(' ')[2]}`}>
                <div className="flex items-center space-x-4">
                    {getRiskIcon(riskLevel)}
                    <div>
                        <h2 className="text-2xl font-bold text-white">Analysis Complete</h2>
                        <p className={`text-sm font-mono ${getRiskColor(riskLevel).split(' ')[0]}`}>
                            RISK LEVEL: {riskLevel}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-bold text-white">{matchPercentage}%</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Match Confidence</div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Related Posts */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Knowledge Base Matches
                    </h3>
                    {relatedPosts.length > 0 ? (
                        <div className="space-y-3">
                            {relatedPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-1.5 h-1.5 rounded-full ${matchPercentage > 80 ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                        <span className="text-gray-200 font-medium truncate max-w-[200px] sm:max-w-xs">
                                            {post.title}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-xs font-mono text-gray-400">
                                            {(post.similarity * 100).toFixed(1)}% SIMILARITY
                                        </span>
                                        <ExternalLink className="w-4 h-4 text-gray-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center text-gray-400 italic">
                            No direct matches found in current database.
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <button
                    onClick={onReset}
                    className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
                >
                    Analyze Another Text
                </button>
            </div>
        </motion.div>
    );
};
