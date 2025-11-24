import React from 'react';
import { motion } from 'framer-motion';
import { Scan } from 'lucide-react';

export const ScanningIndicator: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-6 w-full h-64 bg-black/20 backdrop-blur-sm rounded-xl border border-emerald-500/30 overflow-hidden relative">
            {/* Matrix-like background effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-emerald-500 text-xs font-mono"
                        initial={{ top: -20, left: `${i * 10}%`, opacity: 0 }}
                        animate={{
                            top: ['0%', '100%'],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 2
                        }}
                    >
                        {Array.from({ length: 20 }).map(() => Math.random() > 0.5 ? '1' : '0').join('\n')}
                    </motion.div>
                ))}
            </div>

            {/* Central Scanning Icon */}
            <div className="relative">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-t-2 border-emerald-500 rounded-full w-24 h-24 -m-2 opacity-50"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-b-2 border-emerald-400 rounded-full w-20 h-20 m-0 opacity-50"
                />
                <div className="bg-emerald-900/20 p-6 rounded-full border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <Scan className="w-8 h-8 text-emerald-400" />
                </div>
            </div>

            {/* Text Status */}
            <div className="flex flex-col items-center space-y-2 z-10">
                <motion.h3
                    className="text-xl font-bold text-emerald-400 tracking-wider"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    ANALYZING CONTENT
                </motion.h3>
                <div className="flex space-x-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-emerald-500/60 text-sm font-mono mt-2">
                    Cross-referencing knowledge base...
                </p>
            </div>
        </div>
    );
};
