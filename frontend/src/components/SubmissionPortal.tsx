import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { analyzeContent } from '../api/analysis';
import { motion, AnimatePresence } from 'framer-motion';
import { SubmissionForm } from './SubmissionForm';
import { ScanningIndicator } from './ScanningIndicator';
import { TruthScorecard } from './TruthScorecard';
import { ShieldCheck } from 'lucide-react';

// Mock types for now - will be replaced with real types from API
type AnalysisState = 'IDLE' | 'SCANNING' | 'RESULT';

export const SubmissionPortal: React.FC = () => {
    const [state, setState] = useState<AnalysisState>('IDLE');
    const [result, setResult] = useState<any>(null);

    const { mutate: analyze, isPending } = useMutation({
        mutationFn: analyzeContent,
        onSuccess: (data) => {
            setResult(data);
            setState('RESULT');
        },
        onError: (error) => {
            console.error('Analysis failed:', error);
            setState('IDLE');
            // Ideally show an error toast here
        }
    });

    const handleSubmission = (text: string) => {
        setState('SCANNING');
        analyze(text);
    };

    const handleReset = () => {
        setState('IDLE');
        setResult(null);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 mb-4">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Truth Verification Portal</h1>
                <p className="text-gray-400">
                    Submit content to our autonomous agent network for fact-checking and origin analysis.
                </p>
            </div>

            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    {state === 'IDLE' && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <SubmissionForm onSubmit={handleSubmission} isLoading={isPending} />
                        </motion.div>
                    )}

                    {state === 'SCANNING' && (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <ScanningIndicator />
                        </motion.div>
                    )}

                    {state === 'RESULT' && result && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <TruthScorecard
                                matchPercentage={result.match_percentage}
                                riskLevel={result.risk_level}
                                relatedPosts={result.related_posts}
                                onReset={handleReset}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
