import React, { useState, useEffect } from 'react';
import { Point } from '../../types/route';
import { routeApi, AlgorithmComparisonResponse, saveJourneyToHistory } from '../../services/routeApi';

interface AlgorithmComparisonProps {
  startPoint: Point;
  destinations: Point[];
}

interface AlgorithmInfo {
  name: string;
  displayName: string;
  description: string;
  complexity: string;
  bestFor: string;
}

const ALGORITHMS: AlgorithmInfo[] = [
  {
    name: 'nearest-neighbor',
    displayName: 'Nearest Neighbor',
    description: 'Simple greedy algorithm that always chooses the nearest unvisited destination',
    complexity: 'O(n²)',
    bestFor: 'Quick solutions, small datasets'
  },
  {
    name: '2-opt',
    displayName: '2-Opt',
    description: 'Local search algorithm that improves routes by swapping pairs of edges',
    complexity: 'O(n²)',
    bestFor: 'Good balance of speed and quality'
  },
  {
    name: '3-opt',
    displayName: '3-Opt',
    description: 'Advanced local search that considers three-edge swaps for better optimization',
    complexity: 'O(n³)',
    bestFor: 'High-quality solutions, medium datasets'
  },
  {
    name: 'genetic',
    displayName: 'Genetic Algorithm',
    description: 'Evolutionary algorithm that evolves population of routes to find optimal solution',
    complexity: 'O(g × p × n)',
    bestFor: 'Complex problems, quality over speed'
  }
];

const AlgorithmComparison: React.FC<AlgorithmComparisonProps> = ({ startPoint, destinations }) => {
  const [comparisonResults, setComparisonResults] = useState<AlgorithmComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);

  useEffect(() => {
    if (startPoint && destinations.length > 0) {
      compareAlgorithms();
    }
  }, [startPoint, destinations]);

  // Save best route to history when comparisonResults changes
  useEffect(() => {
    if (comparisonResults && selectedAlgorithm) {
      const bestResult = comparisonResults[selectedAlgorithm];
      if (bestResult && !bestResult.error) {
        saveJourneyToHistory({
          route: [startPoint, ...destinations],
          distance: bestResult.distance,
          duration: bestResult.duration,
          algorithm: selectedAlgorithm,
        }).catch(() => {/* ignore errors for now */});
      }
    }
  }, [comparisonResults, selectedAlgorithm, startPoint, destinations]);

  const compareAlgorithms = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await routeApi.compareAlgorithms(startPoint, destinations);
      setComparisonResults(results);
      
      // Find the best algorithm (lowest distance)
      const bestAlgorithm = Object.entries(results).reduce((best, [name, result]) => {
        if (!result.error && result.distance < best.distance) {
          return { name, ...result };
        }
        return best;
      }, { name: '', distance: Infinity });
      
      setSelectedAlgorithm(bestAlgorithm.name);
    } catch (err) {
      setError('Failed to compare algorithms');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getAlgorithmColor = (algorithmName: string) => {
    const colors = {
      'nearest-neighbor': 'bg-blue-100 border-blue-300',
      '2-opt': 'bg-green-100 border-green-300',
      '3-opt': 'bg-purple-100 border-purple-300',
      'genetic': 'bg-orange-100 border-orange-300'
    };
    return colors[algorithmName as keyof typeof colors] || 'bg-gray-100 border-gray-300';
  };

  const getPerformanceColor = (distance: number, bestDistance: number) => {
    const ratio = distance / bestDistance;
    if (ratio <= 1.05) return 'text-green-600';
    if (ratio <= 1.15) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Algorithm Comparison</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Comparing algorithms...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Algorithm Comparison</h3>
        <div className="text-red-600 text-center py-4">{error}</div>
        <button 
          onClick={compareAlgorithms}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!comparisonResults) {
    return null;
  }

  const bestDistance = Math.min(...Object.values(comparisonResults)
    .filter(result => !result.error)
    .map(result => result.distance));

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Algorithm Comparison</h3>
      
      <div className="space-y-4">
        {ALGORITHMS.map((algorithm) => {
          const result = comparisonResults[algorithm.name];
          if (!result || result.error) return null;

          const isSelected = selectedAlgorithm === algorithm.name;
          const performanceColor = getPerformanceColor(result.distance, bestDistance);
          const isBest = result.distance === bestDistance;

          return (
            <div 
              key={algorithm.name}
              className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                isSelected ? 'ring-2 ring-blue-500' : ''
              } ${getAlgorithmColor(algorithm.name)}`}
              onClick={() => setSelectedAlgorithm(algorithm.name)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">{algorithm.displayName}</h4>
                {isBest && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Best
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{algorithm.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Distance:</span>
                  <span className={`ml-2 font-semibold ${performanceColor}`}>
                    {result.distance.toFixed(2)} km
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Time:</span>
                  <span className="ml-2 font-semibold text-gray-800">
                    {result.duration} min
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Execution:</span>
                  <span className="ml-2 font-semibold text-gray-800">
                    {result.executionTime} ms
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Complexity:</span>
                  <span className="ml-2 font-semibold text-gray-800">
                    {algorithm.complexity}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                <strong>Best for:</strong> {algorithm.bestFor}
              </div>
            </div>
          );
        })}
      </div>

      {selectedAlgorithm && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Selected Algorithm</h4>
          <p className="text-sm text-blue-700">
            {ALGORITHMS.find(a => a.name === selectedAlgorithm)?.displayName} - 
            {comparisonResults[selectedAlgorithm]?.distance.toFixed(2)} km
          </p>
        </div>
      )}
    </div>
  );
};

export default AlgorithmComparison; 