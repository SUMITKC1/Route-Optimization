import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import Footer from '../components/Layout/Footer';
import MapContainer from '../components/Map/MapContainer';
import { routeApi } from '../services/routeApi';
import { saveJourneyToHistory } from '../services/routeApi';
import { Point } from '../types/route';
import { reverseGeocode } from '../utils/geocode';

const MAX_DESTINATIONS = 10;

const LandingPage: React.FC = () => {
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [destinations, setDestinations] = useState<Point[]>([]);
  const [isSelectingStart, setIsSelectingStart] = useState(false);
  const [isSelectingDestination, setIsSelectingDestination] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [algorithm, setAlgorithm] = useState<'nearest-neighbor' | '2-opt' | '3-opt' | 'genetic' | 'dijkstra'>('nearest-neighbor');
  const navigate = useNavigate();
  const headerRef = useRef<any>(null);

  const isAuthenticated = !!localStorage.getItem('token');

  // Activate map selection mode for start
  const handleSelectStart = () => {
    setIsSelectingStart(true);
    setIsSelectingDestination(false);
  };

  // Activate map selection mode for destination
  const handleAddDestination = () => {
    setIsSelectingDestination(true);
    setIsSelectingStart(false);
  };

  // Handle map click
  const handleMapClick = async (lat: number, lng: number) => {
    if (isSelectingStart) {
      const label = await reverseGeocode(lat, lng);
      setStartPoint({ label, lat, lng });
      setIsSelectingStart(false);
    } else if (isSelectingDestination && destinations.length < MAX_DESTINATIONS) {
      const label = await reverseGeocode(lat, lng);
      setDestinations((prev) => [
        ...prev,
        { label, lat, lng },
      ]);
      setIsSelectingDestination(false);
    }
  };

  // Handle marker drag for start point
  const handleStartDrag = async (lat: number, lng: number) => {
    if (startPoint) {
      const label = await reverseGeocode(lat, lng);
      setStartPoint({ ...startPoint, lat, lng, label });
    }
  };

  // Handle marker drag for destinations
  const handleDestinationDrag = async (idx: number, lat: number, lng: number) => {
    const label = await reverseGeocode(lat, lng);
    setDestinations((prev) =>
      prev.map((dest, i) =>
        i === idx ? { ...dest, lat, lng, label } : dest
      )
    );
  };

  const handleRemoveDestination = (idx: number) => {
    setDestinations((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleReorderDestinations = (sourceIdx: number, destIdx: number) => {
    setDestinations((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(sourceIdx, 1);
      updated.splice(destIdx, 0, removed);
      return updated;
    });
  };

  // Reset sidebar to default state
  const handleReset = () => {
    setStartPoint(null);
    setDestinations([]);
    setIsSelectingStart(false);
    setIsSelectingDestination(false);
    setAlgorithm('nearest-neighbor');
    setError(null);
  };

  const handleGo = async () => {
    if (!startPoint) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await routeApi.optimizeRoute({
        startPoint,
        destinations,
        algorithm
      });
      // Save to history
      console.log('Saving to history:', {
        route: [startPoint, ...destinations],
        distance: result.distance,
        duration: result.duration,
        algorithm,
      });
      await saveJourneyToHistory({
        route: [startPoint, ...destinations],
        distance: result.distance,
        duration: result.duration,
        algorithm,
      });
      window.dispatchEvent(new Event('history-updated'));
      setIsLoading(false);
      navigate('/journey', {
        state: {
          startPoint,
          destinations,
          routeSummary: result,
        },
      });
    } catch (err) {
      setIsLoading(false);
      setError('Failed to optimize route. Please try again.');
    }
  };

  const canGo = !!startPoint && destinations.length > 0;

  return (
    <div className="relative w-screen h-screen min-h-screen overflow-hidden bg-white">
      {/* Map covers the entire viewport */}
      <div className="fixed inset-0 z-0">
        <MapContainer
          startPoint={startPoint}
          destinations={destinations}
          isSelectingStart={isSelectingStart}
          isSelectingDestination={isSelectingDestination}
          onMapClick={handleMapClick}
          onStartDrag={handleStartDrag}
          onDestinationDrag={handleDestinationDrag}
        />
        {/* Vignette overlay */}
        <div className="pointer-events-none fixed inset-0 z-10" style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.32) 100%)'}} />
      </div>
      {/* Floating Header/Navbar */}
      <Header ref={headerRef} />
      {/* Floating Sidebar and Controls */}
      {sidebarOpen && (
        <Sidebar
          startPoint={startPoint}
          destinations={destinations}
          isSelectingStart={isSelectingStart}
          isSelectingDestination={isSelectingDestination}
          isLoading={isLoading}
          onSelectStart={handleSelectStart}
          onAddDestination={handleAddDestination}
          onRemoveDestination={handleRemoveDestination}
          onGo={handleGo}
          canGo={canGo}
          onReorderDestinations={handleReorderDestinations}
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          setSidebarOpen={setSidebarOpen}
          triggerHeaderBlink={() => headerRef.current?.startBlink()}
          onReset={handleReset}
        />
      )}
      {/* Loading spinner overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
        </div>
      )}
      {/* Error message floating over map */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-6 py-2 rounded shadow-lg z-50">
          {error}
        </div>
      )}
      {/* Sidebar open button (only when sidebar is closed) */}
      {!sidebarOpen && (
        <button
          className="fixed top-32 left-2 z-40 bg-black text-white rounded-full p-2 shadow-xl focus:outline-none transition-all duration-300 hover:scale-110 border-2 border-black"
          style={{ minWidth: 36, minHeight: 36 }}
          aria-label="Show sidebar"
          onClick={() => setSidebarOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="6" width="12" height="2" rx="1" fill="white"/>
            <rect x="4" y="10" width="12" height="2" rx="1" fill="white"/>
            <rect x="4" y="14" width="8" height="2" rx="1" fill="white"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default LandingPage; 