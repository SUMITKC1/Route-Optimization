import React from 'react';

interface RouteInfoProps {
  totalDistance?: number; // in km
  totalTime?: number; // in minutes
  fuelCost?: number; // in INR
  trafficSummary?: string;
  onStartNavigation?: () => void;
}

const RouteInfo: React.FC<RouteInfoProps> = ({
  totalDistance = 32.5,
  totalTime = 54,
  fuelCost = 210,
  trafficSummary = 'Moderate traffic on main route',
  onStartNavigation,
}) => {
  return (
    <aside className="w-[350px] max-w-[90vw] bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 flex flex-col gap-4">
      <div className="font-extrabold text-xl text-green-800 mb-2">Route Summary</div>
      <div className="flex flex-col gap-3 text-gray-700">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-green-700">Distance:</span>
          <span className="text-black">{totalDistance} km</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-green-700">Estimated Time:</span>
          <span className="text-black">{totalTime} min</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-green-700">Fuel Cost:</span>
          <span className="text-black">₹{fuelCost}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-green-700">Traffic:</span>
          <span className="text-black">{trafficSummary}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-green-700">CO₂ Emissions:</span>
          <span className="text-black">5.2 kg</span> {/* Mock value */}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-green-700">Number of Stops:</span>
          <span className="text-black">3</span> {/* Mock value */}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-green-700">Route Efficiency:</span>
          <span className="text-black">Optimal</span> {/* Mock value */}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-green-700">Alternative Routes:</span>
          <span className="text-black">2</span> {/* Mock value */}
        </div>
      </div>
    </aside>
  );
};

export default RouteInfo; 