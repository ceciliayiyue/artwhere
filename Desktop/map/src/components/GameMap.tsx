import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGame } from '../contexts/GameContext';
import type { Location } from '../types/game';

// Fix for default marker icons in Leaflet with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom pin icons
const createPinIcon = (color: string, label: string) => {
  const bgColor = color === 'blue' ? '#3B82F6' : '#EF4444';
  const fillColor = color === 'blue' ? '#3B82F6' : '#EF4444';

  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="position: relative;">
        <div style="position: absolute; top: -40px; left: 50%; transform: translateX(-50%); white-space: nowrap;">
          <span style="background-color: ${bgColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ${label}
          </span>
        </div>
        <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16C0 28 16 42 16 42C16 42 32 28 32 16C32 7.163 24.837 0 16 0Z"
                fill="${fillColor}"
                stroke="white"
                stroke-width="2"/>
          <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
};

export const GameMap: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const createdMarkerRef = useRef<L.Marker | null>(null);
  const currentMarkerRef = useRef<L.Marker | null>(null);
  const resultLinesRef = useRef<L.Polyline[]>([]);
  const correctMarkersRef = useRef<L.Marker[]>([]);

  const {
    createdPin,
    currentPin,
    setCreatedPin,
    setCurrentPin,
    gameState,
    painting,
    result
  } = useGame();

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle map clicks to place pins
  useEffect(() => {
    if (!mapRef.current || gameState !== 'playing') return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const location: Location = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      };

      // Place created pin first, then current pin
      if (!createdPin.location) {
        setCreatedPin(location);
      } else if (!currentPin.location) {
        setCurrentPin(location);
      }
    };

    mapRef.current.on('click', handleMapClick);

    return () => {
      mapRef.current?.off('click', handleMapClick);
    };
  }, [gameState, createdPin.location, currentPin.location, setCreatedPin, setCurrentPin]);

  // Update created pin marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (createdMarkerRef.current) {
      mapRef.current.removeLayer(createdMarkerRef.current);
      createdMarkerRef.current = null;
    }

    if (createdPin.location) {
      const marker = L.marker(
        [createdPin.location.lat, createdPin.location.lng],
        {
          icon: createPinIcon('blue', 'Where created?'),
          draggable: gameState === 'playing',
        }
      ).addTo(mapRef.current);

      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        setCreatedPin({ lat: newPos.lat, lng: newPos.lng });
      });

      createdMarkerRef.current = marker;
    }
  }, [createdPin.location, gameState, setCreatedPin]);

  // Update current pin marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (currentMarkerRef.current) {
      mapRef.current.removeLayer(currentMarkerRef.current);
      currentMarkerRef.current = null;
    }

    if (currentPin.location) {
      const marker = L.marker(
        [currentPin.location.lat, currentPin.location.lng],
        {
          icon: createPinIcon('red', 'Where now?'),
          draggable: gameState === 'playing',
        }
      ).addTo(mapRef.current);

      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        setCurrentPin({ lat: newPos.lat, lng: newPos.lng });
      });

      currentMarkerRef.current = marker;
    }
  }, [currentPin.location, gameState, setCurrentPin]);

  // Show result lines after submission
  useEffect(() => {
    if (!mapRef.current || !painting || gameState !== 'submitted' || !result) return;

    // Clear old lines and markers
    resultLinesRef.current.forEach(line => mapRef.current?.removeLayer(line));
    resultLinesRef.current = [];
    correctMarkersRef.current.forEach(marker => mapRef.current?.removeLayer(marker));
    correctMarkersRef.current = [];

    // Draw line from created guess to actual if wrong
    if (!result.createdCorrect && createdPin.location) {
      const line = L.polyline(
        [
          [createdPin.location.lat, createdPin.location.lng],
          [painting.createdLocation.lat, painting.createdLocation.lng],
        ],
        {
          color: '#3B82F6',
          weight: 2,
          opacity: 0.7,
          dashArray: '10, 10',
        }
      ).addTo(mapRef.current);
      resultLinesRef.current.push(line);

      // Add correct location marker
      const correctMarker = L.marker(
        [painting.createdLocation.lat, painting.createdLocation.lng],
        { icon: createPinIcon('blue', '✓ Created here') }
      ).addTo(mapRef.current);
      correctMarkersRef.current.push(correctMarker);
    }

    // Draw line from current guess to actual if wrong
    if (!result.currentCorrect && currentPin.location) {
      const line = L.polyline(
        [
          [currentPin.location.lat, currentPin.location.lng],
          [painting.currentLocation.lat, painting.currentLocation.lng],
        ],
        {
          color: '#EF4444',
          weight: 2,
          opacity: 0.7,
          dashArray: '10, 10',
        }
      ).addTo(mapRef.current);
      resultLinesRef.current.push(line);

      // Add correct location marker
      const correctMarker = L.marker(
        [painting.currentLocation.lat, painting.currentLocation.lng],
        { icon: createPinIcon('red', '✓ Located here') }
      ).addTo(mapRef.current);
      correctMarkersRef.current.push(correctMarker);
    }
  }, [gameState, result, painting, createdPin.location, currentPin.location]);

  // Clear all result markers when transitioning to next painting
  useEffect(() => {
    if (gameState === 'loading' && mapRef.current) {
      // Clear result lines
      resultLinesRef.current.forEach(line => mapRef.current?.removeLayer(line));
      resultLinesRef.current = [];

      // Clear correct answer markers
      correctMarkersRef.current.forEach(marker => mapRef.current?.removeLayer(marker));
      correctMarkersRef.current = [];
    }
  }, [gameState]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {gameState === 'playing' && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <p className="text-sm text-gray-600">
            Click on the map to place your pins
          </p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center text-xs">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
              <span className={createdPin.location ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                {createdPin.location ? '✓ Created location' : 'Where created?'}
              </span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <span className={currentPin.location ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                {currentPin.location ? '✓ Current location' : 'Where now?'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
