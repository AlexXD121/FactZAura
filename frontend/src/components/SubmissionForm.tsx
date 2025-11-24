import React, { useState } from 'react';
import { Send, FileText } from 'lucide-react';

interface SubmissionFormProps {
    onSubmit: (text: string) => void;
    isLoading: boolean;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSubmit, isLoading }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSubmit(text);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                <div className="relative bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 p-1">
                    <div className="flex items-center space-x-2 px-4 py-2 border-b border-white/5 text-gray-400 text-sm">
                        <FileText className="w-4 h-4" />
                        <span>Content Analysis Input</span>
                    </div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste suspicious text, news articles, or social media posts here for verification..."
                        className="w-full h-40 bg-transparent text-gray-200 p-4 focus:outline-none resize-none placeholder-gray-600"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={!text.trim() || isLoading}
                    className={`
            flex items-center space-x-2 px-6 py-3 rounded-lg font-bold text-white transition-all duration-200
            ${!text.trim() || isLoading
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]'}
          `}
                >
                    <span>{isLoading ? 'Processing...' : 'Verify Content'}</span>
                    <Send className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
                </button>
            </div>
        </form>
    );
};
