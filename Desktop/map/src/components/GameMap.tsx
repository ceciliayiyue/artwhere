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
  // Color mapping for different pin types
  const colorMap: { [key: string]: string } = {
    lightBrown: '#A0826D',   // User guess for "created"
    darkBrown: '#8B6F47',    // User guess for "current"
    green: '#10B981',        // Correct answers (all)
  };

  const fillColor = colorMap[color] || '#6B7280'; // fallback to gray

  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="position: relative;">
        <div style="position: absolute; top: -40px; left: 50%; transform: translateX(-50%); white-space: nowrap;">
          <span style="background-color: ${fillColor}; color: white; padding: 6px 10px; border-radius: 6px; font-size: 15px; font-weight: 700; box-shadow: 0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1); font-family: 'Outfit', sans-serif;">
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
  const boatMarkerRef = useRef<L.Marker | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
      // If submitted and correct, show green; otherwise brown
      const isCorrect = gameState === 'submitted' && result?.createdCorrect;
      const pinColor = isCorrect ? 'green' : 'lightBrown';
      const pinLabel = isCorrect ? '✓ Correct!' : 'Where created?';

      const marker = L.marker(
        [createdPin.location.lat, createdPin.location.lng],
        {
          icon: createPinIcon(pinColor, pinLabel),
          draggable: gameState === 'playing',
        }
      ).addTo(mapRef.current);

      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        setCreatedPin({ lat: newPos.lat, lng: newPos.lng });
      });

      createdMarkerRef.current = marker;
    }
  }, [createdPin.location, gameState, result, setCreatedPin]);

  // Update current pin marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (currentMarkerRef.current) {
      mapRef.current.removeLayer(currentMarkerRef.current);
      currentMarkerRef.current = null;
    }

    if (currentPin.location) {
      // If submitted and correct, show green; otherwise brown
      const isCorrect = gameState === 'submitted' && result?.currentCorrect;
      const pinColor = isCorrect ? 'green' : 'darkBrown';
      const pinLabel = isCorrect ? '✓ Correct!' : 'Where now?';

      const marker = L.marker(
        [currentPin.location.lat, currentPin.location.lng],
        {
          icon: createPinIcon(pinColor, pinLabel),
          draggable: gameState === 'playing',
        }
      ).addTo(mapRef.current);

      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        setCurrentPin({ lat: newPos.lat, lng: newPos.lng });
      });

      currentMarkerRef.current = marker;
    }
  }, [currentPin.location, gameState, result, setCurrentPin]);

  // Show journey lines after submission
  useEffect(() => {
    if (!mapRef.current || !painting || gameState !== 'submitted' || !result) return;

    // Clear old lines and markers
    resultLinesRef.current.forEach(line => mapRef.current?.removeLayer(line));
    resultLinesRef.current = [];
    correctMarkersRef.current.forEach(marker => mapRef.current?.removeLayer(marker));
    correctMarkersRef.current = [];

    // Draw USER'S imagined journey (BROWN line from created guess to current guess)
    if (createdPin.location && currentPin.location) {
      const userJourneyLine = L.polyline(
        [
          [createdPin.location.lat, createdPin.location.lng],
          [currentPin.location.lat, currentPin.location.lng],
        ],
        {
          color: '#8B6F47', // Brown - user's imagined path
          weight: 3,
          opacity: 0.7,
          dashArray: '5, 10',
        }
      ).addTo(mapRef.current);
      resultLinesRef.current.push(userJourneyLine);
    }

    // Draw ACTUAL painting journey (GREEN line from created to current location)
    const actualJourneyLine = L.polyline(
      [
        [painting.createdLocation.lat, painting.createdLocation.lng],
        [painting.currentLocation.lat, painting.currentLocation.lng],
      ],
      {
        color: '#10B981', // Green - actual path
        weight: 3,
        opacity: 0.7,
        dashArray: '5, 10',
      }
    ).addTo(mapRef.current);
    resultLinesRef.current.push(actualJourneyLine);

    // Add correct location markers only if user was wrong
    if (!result.createdCorrect) {
      const correctCreatedMarker = L.marker(
        [painting.createdLocation.lat, painting.createdLocation.lng],
        { icon: createPinIcon('green', '✓ Created here') }
      ).addTo(mapRef.current);
      correctMarkersRef.current.push(correctCreatedMarker);
    }

    if (!result.currentCorrect) {
      const correctCurrentMarker = L.marker(
        [painting.currentLocation.lat, painting.currentLocation.lng],
        { icon: createPinIcon('green', '✓ Located here') }
      ).addTo(mapRef.current);
      correctMarkersRef.current.push(correctCurrentMarker);
    }
  }, [gameState, result, painting, createdPin.location, currentPin.location]);

  // Animate boat with painting miniature along journey path
  useEffect(() => {
    if (!mapRef.current || !painting || gameState !== 'submitted') return;

    // Clear existing boat if any
    if (boatMarkerRef.current) {
      mapRef.current.removeLayer(boatMarkerRef.current);
      boatMarkerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Create boat icon with painting thumbnail
    const boatIcon = L.divIcon({
      className: 'boat-marker',
      html: `
        <div style="display: flex; align-items: center; gap: 8px; transform: translateX(-50%) translateY(-100%);">
          <div style="font-size: 40px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">⛵</div>
          <div style="width: 50px; height: 50px; border: 3px solid white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.3); background: white;">
            <img src="${painting.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
        </div>
      `,
      iconSize: [100, 60],
      iconAnchor: [50, 60],
    });

    // Start position (where created)
    const startLat = painting.createdLocation.lat;
    const startLng = painting.createdLocation.lng;

    // End position (where now)
    const endLat = painting.currentLocation.lat;
    const endLng = painting.currentLocation.lng;

    // Create marker at start position
    const boatMarker = L.marker([startLat, startLng], { icon: boatIcon }).addTo(mapRef.current);
    boatMarkerRef.current = boatMarker;

    // Animate the boat
    const duration = 4000; // 4 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      // Calculate current position
      const currentLat = startLat + (endLat - startLat) * easeProgress;
      const currentLng = startLng + (endLng - startLng) * easeProgress;

      // Update marker position
      if (boatMarkerRef.current) {
        boatMarkerRef.current.setLatLng([currentLat, currentLng]);
      }

      // Continue animation if not finished
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, painting]);

  // Clear all result markers when transitioning to next painting
  useEffect(() => {
    if (gameState === 'loading' && mapRef.current) {
      // Clear result lines
      resultLinesRef.current.forEach(line => mapRef.current?.removeLayer(line));
      resultLinesRef.current = [];

      // Clear correct answer markers
      correctMarkersRef.current.forEach(marker => mapRef.current?.removeLayer(marker));
      correctMarkersRef.current = [];

      // Clear boat marker
      if (boatMarkerRef.current) {
        mapRef.current.removeLayer(boatMarkerRef.current);
        boatMarkerRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [gameState]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};
