import React, { useEffect, useState } from 'react';
import { RouteOptimizationResult, Point } from '../types/route';
import { fetchHistory, deleteHistoryEntry, clearHistory } from '../services/routeApi';
import Header from '../components/Layout/Header';
import { useNavigate } from 'react-router-dom';

interface JourneyHistory {
  _id: string;
  route: Point[];
  distance: number;
  duration: number;
  algorithm: string;
  createdAt: string;
}

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<JourneyHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndSetHistory = async () => {
      setLoading(true);
      try {
        const data = await fetchHistory();
        setHistory(data);
      } catch (err: any) {
        setError('Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchAndSetHistory();
    const handler = () => fetchAndSetHistory();
    window.addEventListener('history-updated', handler);
    return () => window.removeEventListener('history-updated', handler);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteHistoryEntry(id);
      setHistory(h => h.filter(j => j._id !== id));
    } catch {
      setError('Failed to delete entry');
    }
  };

  const handleClear = async () => {
    try {
      await clearHistory();
      setHistory([]);
    } catch {
      setError('Failed to clear history');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-200 via-blue-100 to-purple-200 animate-gradient-move relative overflow-x-hidden">
      <Header />
      <div className="max-w-3xl mx-auto p-6 mt-32 bg-white rounded-2xl shadow-lg relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-green-700">Journey History</h2>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            onClick={() => navigate('/')}
          >
            Home
          </button>
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button
          className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          onClick={handleClear}
          disabled={loading || history.length === 0}
        >
          Clear All
        </button>
        {loading ? (
          <div>Loading...</div>
        ) : history.length === 0 ? (
          <div className="text-gray-500">No journey history found.</div>
        ) : (
          <ul className="space-y-4">
            {history.map(j => (
              <li key={j._id} className="p-4 bg-green-50 rounded-xl flex flex-col md:flex-row md:items-center justify-between shadow border border-green-100">
                <div>
                  <div className="font-semibold text-green-800">{j.route.map(p => p.label).join(' → ')}</div>
                  <div className="text-sm text-gray-600">{new Date(j.createdAt).toLocaleString()}</div>
                  <div className="text-sm text-gray-700 mt-1">Algorithm: <span className="font-mono">{j.algorithm}</span></div>
                  <div className="text-sm text-gray-700">Distance: {j.distance.toFixed(2)} km | Duration: {j.duration.toFixed(2)} min</div>
                </div>
                <button
                  className="mt-2 md:mt-0 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                  onClick={() => handleDelete(j._id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HistoryPage; 