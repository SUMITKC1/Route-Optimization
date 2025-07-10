import React, { useState } from 'react';

type AltRoute = {
  id: number;
  order: string[];
  distance: number;
  eta: number;
};

interface AlternativeRoutesProps {
  points: string[];
}

function generateMockRoutes(points: string[]): AltRoute[] {
  if (points.length < 2) return [];
  // Generate 3 mock permutations for demo
  const perms = [
    points,
    [...points.slice(0, 1), ...points.slice(1).reverse()],
    [points[0], ...points.slice(1).sort()],
  ];
  return perms.map((order, i) => ({
    id: i + 1,
    order,
    distance: 32.5 + i * 2,
    eta: 54 + i * 3,
  }));
}

const AlternativeRoutes: React.FC<AlternativeRoutesProps> = ({ points }) => {
  const mockRoutes = generateMockRoutes(points);
  const [selected, setSelected] = useState<number>(1);

  if (mockRoutes.length === 0) {
    return <div className="text-gray-500">No alternative routes available.</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 w-full max-w-2xl mx-auto mt-4 border border-green-200">
      <h3 className="text-xl font-bold mb-2 text-green-800">Alternative Routes</h3>
      <div className="flex flex-col gap-3">
        {mockRoutes.map(route => (
          <div
            key={route.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition ${selected === route.id ? 'border-green-600 bg-green-50' : 'border-green-200 bg-green-100'}`}
          >
            <div className="flex flex-col">
              <span className="font-semibold text-lg text-green-900">{route.order.join(' → ')}</span>
              <span className="text-sm text-green-700">{route.distance} km, {route.eta} min</span>
            </div>
            <button
              className={`ml-4 px-4 py-2 rounded font-bold text-white transition ${selected === route.id ? 'bg-green-700' : 'bg-green-400 hover:bg-green-600'}`}
              onClick={() => setSelected(route.id)}
            >
              {selected === route.id ? 'Selected' : 'Select'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlternativeRoutes; 