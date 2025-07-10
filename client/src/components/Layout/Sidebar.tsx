// @ts-ignore: Suppress missing type declaration for react-beautiful-dnd
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot, DroppableProvided } from 'react-beautiful-dnd';
import React, { useState } from 'react';
import LoadingSpinner from '../Common/LoadingSpinner';
import { Point } from '../../types/route';
import Modal from '../Common/Modal';

interface SidebarProps {
  startPoint: Point | null;
  destinations: Point[];
  isSelectingStart: boolean;
  isSelectingDestination: boolean;
  isLoading: boolean;
  onSelectStart: () => void;
  onAddDestination: () => void;
  onRemoveDestination: (idx: number) => void;
  onGo: () => void;
  canGo: boolean;
  onReorderDestinations: (sourceIdx: number, destIdx: number) => void;
  algorithm: 'nearest-neighbor' | '2-opt' | '3-opt' | 'genetic' | 'dijkstra';
  setAlgorithm: (algo: 'nearest-neighbor' | '2-opt' | '3-opt' | 'genetic' | 'dijkstra') => void;
  setSidebarOpen: (open: boolean) => void;
  triggerHeaderBlink?: () => void;
  onReset: () => void;
}

const MAX_DESTINATIONS = 10;

const ALGORITHM_OPTIONS = [
  { value: 'nearest-neighbor', label: 'Nearest Neighbor', description: 'Fast greedy algorithm' },
  { value: '2-opt', label: '2-Opt', description: 'Good balance of speed & quality' },
  { value: '3-opt', label: '3-Opt', description: 'High quality optimization' },
  { value: 'genetic', label: 'Genetic Algorithm', description: 'Best quality, slower' },
  { value: 'dijkstra', label: 'Dijkstra', description: 'Point-to-point routing' },
];

const Sidebar: React.FC<SidebarProps> = ({
  startPoint,
  destinations,
  isSelectingStart,
  isSelectingDestination,
  isLoading,
  onSelectStart,
  onAddDestination,
  onRemoveDestination,
  onGo,
  canGo,
  onReorderDestinations,
  algorithm,
  setAlgorithm,
  setSidebarOpen,
  triggerHeaderBlink,
  onReset,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Drag and drop handler
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index !== result.destination.index) {
      onReorderDestinations(result.source.index, result.destination.index);
    }
  };
  
  const handleGoClick = () => {
    if (!localStorage.getItem('token')) {
      setShowAuthModal(true);
      if (triggerHeaderBlink) triggerHeaderBlink();
      return;
    }
    onGo();
  };

  return (
    <aside className="fixed top-28 left-10 z-30 w-[350px] max-w-full bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header with close button */}
      <div className="flex-shrink-0 p-6 pb-4 relative">
        <div className="absolute top-1 right-1 flex gap-2">
          {/* Reset button */}
          <button
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full shadow focus:outline-none transition-colors"
            aria-label="Reset sidebar"
            onClick={onReset}
            disabled={isLoading}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3a5 5 0 0 0-5 5H1l3.5 3.5L8 8H6a2 2 0 1 1 2 2v2a4 4 0 1 0-4-4H2a6 6 0 1 1 6 6v-2a4 4 0 0 0 0-8z" fill="#555"/>
            </svg>
          </button>
          {/* Close button */}
      <button
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full shadow focus:outline-none"
        aria-label="Close sidebar"
        onClick={() => setSidebarOpen(false)}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 5L13 13M13 5L5 13" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
        </div>
        
      {/* Start Location */}
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Start Location</div>
        <button
          className={`w-full bg-green-800 text-white text-lg font-semibold rounded mb-2 py-1 ${isSelectingStart ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
          onClick={onSelectStart}
          disabled={isSelectingStart || isLoading}
          aria-label="Select start point on map"
          tabIndex={0}
        >
            {isSelectingStart ? 'Selecting...' : 'Add a Starting Point'}
        </button>
        <div className="w-full text-center text-black text-lg mb-4">
          {startPoint ? startPoint.label : <span className="text-gray-400">Point A</span>}
        </div>
      </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-6 custom-scrollbar smooth-scroll">
        <div className="border-t border-gray-200 mb-6" />
        
      {/* Destinations */}
        <div className="mb-6">
        <div className="text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Destinations</div>
        <button
          className={`w-full bg-green-800 text-white text-lg font-semibold rounded mb-2 py-1 ${isSelectingDestination ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
          onClick={onAddDestination}
          disabled={isSelectingDestination || destinations.length >= 10 || isLoading}
          aria-label="Add a destination point on map"
          tabIndex={0}
        >
            {isSelectingDestination ? 'Selecting...' : 'Add Destinations'}
        </button>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar smooth-scroll">
          {destinations.map((dest, idx) => (
            <div key={idx} className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded px-3 py-2 text-black font-medium shadow-inner text-sm">{dest.label}</div>
              <button
                  className="text-red-500 hover:text-red-700 font-bold text-lg px-2 rounded-full bg-gray-100 hover:bg-red-100 transition flex-shrink-0"
                onClick={() => onRemoveDestination(idx)}
                disabled={isLoading}
                aria-label={`Remove destination ${idx + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
        
        <div className="border-t border-gray-200 mb-6" />
        
      {/* Algorithm Selection */}
        <div className="mb-6">
        <div className="text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Algorithm</div>
        <div className="relative">
          <select
            id="algorithm"
            value={algorithm}
            onChange={e => setAlgorithm(e.target.value as 'nearest-neighbor' | '2-opt' | '3-opt' | 'genetic' | 'dijkstra')}
            className="appearance-none rounded-lg px-4 py-2 pr-10 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black-500 text-sm w-full bg-white shadow transition duration-150 ease-in-out hover:border-black-600 disabled:bg-gray-100"
            disabled={isLoading}
          >
            <option value="nearest-neighbor">Nearest Neighbor</option>
            <option value="2-opt">2-Opt</option>
            <option value="3-opt">3-Opt</option>
            <option value="genetic">Genetic Algorithm</option>
            <option value="dijkstra">Dijkstra</option>
          </select>
          {/* Custom dropdown arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1 text-center">
          {(() => {
            switch (algorithm) {
              case 'nearest-neighbor': return 'Fast greedy algorithm';
              case '2-opt': return 'Good balance of speed & quality';
              case '3-opt': return 'High quality optimization';
              case 'genetic': return 'Best quality, slower';
              case 'dijkstra': return 'Point-to-point routing';
              default: return '';
            }
          })()}
        </div>
      </div>
      </div>

      {/* Fixed footer with GO button */}
      <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200 bg-white rounded-b-2xl">
        <div className="flex justify-center">
        <button
            className={`w-1/2 text-lg font-bold rounded-md px-8 py-3 shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl ${
              canGo && !isLoading 
                ? 'bg-gray-300 text-green-700 hover:bg-green-700 hover:text-white' 
                : 'bg-green-800 text-white border-2 border-white'
            } ${!canGo || isLoading ? 'cursor-not-allowed' : 'cursor-pointer'} opacity-100`}
          onClick={handleGoClick}
          disabled={!canGo || isLoading}
          aria-label="Calculate and view optimized journey"
        >
          {isLoading ? <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white inline-block align-middle" /> : 'GO'}
        </button>
      </div>
      </div>

      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Login or Sign Up Required</h2>
          <p className="mb-4 text-gray-600">Please login or sign up to use route optimization features.</p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="/login" className="px-6 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-900 transition">Login / Sign Up</a>
          </div>
        </div>
      </Modal>
    </aside>
  );
};

export default Sidebar; 