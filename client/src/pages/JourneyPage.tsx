import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import MapContainer from '../components/Map/MapContainer';
import RouteInfo from '../components/JourneyPage/RouteInfo';
import AlternativeRoutes from '../components/JourneyPage/AlternativeRoutes';
import AlgorithmComparison from '../components/JourneyPage/AlgorithmComparison';
import { Point } from '../types/route';

const JourneyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { startPoint, destinations } = (location.state || {}) as {
    startPoint: Point | null;
    destinations: Point[];
  };

  // If no data, redirect to landing
  React.useEffect(() => {
    if (!startPoint || !destinations || destinations.length === 0) {
      navigate('/');
    }
  }, [startPoint, destinations, navigate]);

  // Animation and step state
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState<{ idx: number; label: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'route' | 'comparison'>('route');

  // Route: start + destinations
  const route: Point[] = startPoint ? [startPoint, ...destinations] : [];

  // Handle point click (UI only)
  const handlePointClick = (idx: number) => {
    setCurrentStep(idx);
    setShowPopup({ idx, label: route[idx]?.label || '' });
    setTimeout(() => setShowPopup(null), 1800);
  };

  // Map A, B, C, D to S, D1, D2, D3
  function getDisplayLabel(idx: number) {
    if (idx === 0) return 'S';
    return `D${idx}`;
  }

  const dashboardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center bg-white overflow-x-hidden overflow-y-auto min-h-[120vh]">
        {/* Map fills the top area */}
        <div className="w-full h-[700px] relative z-0">
          <MapContainer
            startPoint={startPoint}
            destinations={destinations || []}
            isSelectingStart={false}
            isSelectingDestination={false}
            onMapClick={() => {}}
            onStartDrag={() => {}}
            onDestinationDrag={() => {}}
            route={route}
            animateRoute={true}
            currentStep={currentStep ?? undefined}
            onPointClick={handlePointClick}
          />
          {showPopup && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-2 rounded shadow-lg font-semibold z-50 animate-fade-in">
              {showPopup.label}
            </div>
          )}
          {/* Floating scroll button */}
          <button
            className="journey-bounce absolute right-0 -translate-x-1/2 bottom-[97.33px] px-5 py-3 rounded-lg shadow-lg text-black font-bold text-2xl transition focus:outline-none focus:ring-2 focus:ring-gray-400"
            style={{
              background: 'white',
            }}
            aria-label="Scroll to details"
            onClick={() => dashboardRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            Journey
          </button>
        </div>
        {/* Data Dashboards below the map */}
        <div ref={dashboardRef} className="w-full max-w-6xl flex flex-col gap-6 items-center mt-6 mb-4">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-lg p-2 flex gap-2 mb-2">
            <button
              onClick={() => setActiveTab('route')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'route'
                  ? 'bg-green-700 text-white'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              Route
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'comparison'
                  ? 'bg-green-700 text-white'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              Algorithms
            </button>
          </div>

          {/* Route Tab Content */}
          {activeTab === 'route' && (
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden border border-gray-200">
              {/* Left: Journey Summary */}
              <div className="flex-1 p-6 flex flex-col items-center justify-center bg-[#f5f7fa] border-b md:border-b-0 md:border-r border-gray-200">
                <RouteInfo />
              </div>
              {/* Right: Alternative Routes */}
              <div className="flex-1 p-6 flex flex-col items-center justify-center bg-[#f0f7e7]">
                <AlternativeRoutes points={route.map((p) => p.label)} />
              </div>
            </div>
          )}

          {/* Comparison Tab Content */}
          {activeTab === 'comparison' && startPoint && (
            <div className="w-full max-w-3xl flex justify-center">
              <AlgorithmComparison startPoint={startPoint} destinations={destinations} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default JourneyPage; 