import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { FeedLayout } from './components/FeedLayout';
import { useIncidents } from './hooks/useIncidents';
import { useIncidentSocket } from './hooks/useIncidentSocket';
import { TreeVisualization } from './components/tree/TreeVisualization';
import { SubmissionPortal } from './components/SubmissionPortal';
import { motion, AnimatePresence } from 'framer-motion';

function Dashboard() {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const { data: incidents = [], isLoading, error } = useIncidents();

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-400">
        <div className="text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <div>Error loading incidents. Is the backend running?</div>
        </div>
      </div>
    );
  }

  const { posts, isLoading: isTreeLoading } = useIncidentSocket(selectedIncidentId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent animate-shimmer">
            FactSaura
          </h1>
          <p className="text-slate-400 mt-1">Misinformation Immunity Platform</p>
          <div className="absolute -bottom-2 left-0 w-32 h-1 bg-gradient-to-r from-emerald-500 to-transparent rounded-full" />
        </motion.header>

        <main className="space-y-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FeedLayout
              incidents={incidents}
              onIncidentSelect={setSelectedIncidentId}
              selectedId={selectedIncidentId}
              isLoading={isLoading}
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {selectedIncidentId && (
              <motion.div
                key={selectedIncidentId}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <TreeVisualization posts={posts} isLoading={isTreeLoading} />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="border-t border-slate-800 pt-8"
          >
            <SubmissionPortal />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}


export default App;
