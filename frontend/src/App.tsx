import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { FeedLayout } from './components/FeedLayout';
import { useIncidents } from './hooks/useIncidents';
import { useIncidentSocket } from './hooks/useIncidentSocket';
import { TreeVisualization } from './components/tree/TreeVisualization';
import { SubmissionPortal } from './components/SubmissionPortal';

function Dashboard() {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const { data: incidents = [], isLoading, error } = useIncidents();

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-400">
        Error loading incidents. Is the backend running?
      </div>
    );
  }

  const { posts, isLoading: isTreeLoading } = useIncidentSocket(selectedIncidentId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            FactSaura
          </h1>
          <p className="text-slate-400">Misinformation Immunity Platform</p>
        </header>

        <main className="space-y-8">
          <FeedLayout
            incidents={incidents}
            onIncidentSelect={setSelectedIncidentId}
            selectedId={selectedIncidentId}
            isLoading={isLoading}
          />

          {selectedIncidentId && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <TreeVisualization posts={posts} isLoading={isTreeLoading} />
            </div>
          )}

          <div className="border-t border-slate-800 pt-8">
            <SubmissionPortal />
          </div>
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
