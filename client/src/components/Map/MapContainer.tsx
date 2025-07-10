import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';

type Point = { label: string; lat: number; lng: number };

interface MapContainerProps {
  startPoint: Point | null;
  destinations: Point[];
  isSelectingStart: boolean;
  isSelectingDestination: boolean;
  onMapClick: (lat: number, lng: number) => void;
  onStartDrag: (lat: number, lng: number) => void;
  onDestinationDrag: (idx: number, lat: number, lng: number) => void;
  route?: Point[];
  animateRoute?: boolean;
  currentStep?: number;
  onPointClick?: (idx: number) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%',
  // borderRadius: '1rem', // Remove rounded corners
  position: 'relative' as const,
};

const MapContainer: React.FC<MapContainerProps> = ({
  startPoint,
  destinations,
  isSelectingStart,
  isSelectingDestination,
  onMapClick,
  onStartDrag,
  onDestinationDrag,
  route,
  animateRoute,
  currentStep,
  onPointClick,
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  const [animatedPath, setAnimatedPath] = useState<Array<{ lat: number; lng: number }>>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (animateRoute && route && route.length > 1) {
      setAnimatedPath([]);
      let i = 0;
      const animate = () => {
        if (!route) return;
        setAnimatedPath(route.slice(0, i + 1).map(p => ({ lat: p.lat, lng: p.lng })));
        if (i < route.length - 1) {
          i++;
          animationRef.current = window.setTimeout(animate, 350);
        }
      };
      animate();
      return () => {
        if (animationRef.current) window.clearTimeout(animationRef.current);
      };
    } else if (route) {
      setAnimatedPath(route.map(p => ({ lat: p.lat, lng: p.lng })));
    }
  }, [route, animateRoute]);

  if (loadError) return <div className="text-red-600">Error loading map</div>;
  if (!isLoaded) return <div className="text-gray-600">Loading map...</div>;

  const center = startPoint || { lat: 28.6139, lng: 77.2090 };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    if (isSelectingStart || isSelectingDestination) {
      onMapClick(e.latLng.lat(), e.latLng.lng());
    }
  };

  return (
    <div className="relative w-full h-full">
      {(isSelectingStart || isSelectingDestination) && (
        <div className="absolute z-50 top-4 left-1/2 -translate-x-1/2 bg-yellow-200 text-black px-4 py-2 rounded shadow-lg font-semibold animate-pulse pointer-events-none">
          {isSelectingStart ? 'Click on the map to select the Start Point' : 'Click on the map to add a Destination'}
        </div>
      )}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          draggableCursor: isSelectingStart || isSelectingDestination ? 'crosshair' : undefined,
          gestureHandling: 'greedy', // Allow normal scroll-to-zoom
          scrollwheel: true, // Enable scroll-to-zoom
        }}
        onClick={handleMapClick}
      >
        {startPoint && (
          <Marker
            position={{ lat: startPoint.lat, lng: startPoint.lng }}
            label="A"
            draggable
            onDragEnd={(e: google.maps.MapMouseEvent) => {
              if (e.latLng) onStartDrag(e.latLng.lat(), e.latLng.lng());
            }}
            onClick={() => onPointClick && onPointClick(0)}
            icon={currentStep === 0 ? undefined : undefined}
          />
        )}
        {destinations.map((dest, idx) => (
          <Marker
            key={idx}
            position={{ lat: dest.lat, lng: dest.lng }}
            label={String.fromCharCode(66 + idx)}
            draggable
            onDragEnd={(e: google.maps.MapMouseEvent) => {
              if (e.latLng) onDestinationDrag(idx, e.latLng.lat(), e.latLng.lng());
            }}
            onClick={() => onPointClick && onPointClick(idx + 1)}
            icon={currentStep === idx + 1 ? undefined : undefined}
          />
        ))}
        {animatedPath.length > 1 && (
          <Polyline
            path={animatedPath}
            options={{
              strokeColor: '#2e2e2e',
              strokeOpacity: 0.9,
              strokeWeight: 5,
              zIndex: 2,
              icons: [
                typeof window !== 'undefined' && (window.google && window.google.maps)
                  ? {
                      icon: { path: window.google.maps.SymbolPath.FORWARD_OPEN_ARROW },
                      offset: '100%',
                    }
                  : {},
              ],
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default MapContainer; 