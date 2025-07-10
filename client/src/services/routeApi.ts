import { Point } from '../types/route';

export interface RouteOptimizationRequest {
  startPoint: Point;
  destinations: Point[];
  algorithm: 'nearest-neighbor' | '2-opt' | '3-opt' | 'genetic' | 'dijkstra';
}

export interface RouteOptimizationResponse {
  optimizedRoute: Point[];
  distance: number;
  duration: number;
  executionTime: number;
  steps: string[];
}

export interface AlgorithmComparisonResponse {
  [key: string]: {
    route: Point[];
    distance: number;
    duration: number;
    executionTime: number;
    steps: string[];
    error?: string;
  };
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const routeApi = {
  async optimizeRoute(request: RouteOptimizationRequest): Promise<RouteOptimizationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error optimizing route:', error);
      throw error;
    }
  },

  async compareAlgorithms(startPoint: Point, destinations: Point[]): Promise<AlgorithmComparisonResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/compare-algorithms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startPoint, destinations }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error comparing algorithms:', error);
      throw error;
    }
  },
};

export async function fetchHistory() {
  const res = await fetch('/api/history', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function deleteHistoryEntry(id: string) {
  const res = await fetch(`/api/history/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  if (!res.ok) throw new Error('Failed to delete entry');
}

export async function clearHistory() {
  const res = await fetch('/api/history', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  if (!res.ok) throw new Error('Failed to clear history');
}

export async function saveJourneyToHistory({ route, distance, duration, algorithm }: { route: Point[]; distance: number; duration: number; algorithm: string }) {
  const res = await fetch('/api/history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ route, distance, duration, algorithm }),
  });
  if (!res.ok) throw new Error('Failed to save journey to history');
  return res.json();
} 