import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGame } from '../contexts/GameContext';
import type { Location } from '../types/game';
import { StoryPanel } from './StoryPanel';

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
          <span style="background-color: ${fillColor}; color: white; padding: 6px 10px; border-radius: 6px; font-size: 20px; font-weight: 700; box-shadow: 0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1); font-family: 'Outfit', sans-serif;">
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
  const guessMarkerRef = useRef<L.Marker | null>(null);
  const resultLinesRef = useRef<L.Polyline[]>([]);
  const correctMarkersRef = useRef<L.Marker[]>([]);
  const provenanceLineRef = useRef<L.Polyline | null>(null);
  const animatedProvenanceRef = useRef<L.Polyline | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const {
    guessPin,
    setGuessPin,
    gameState,
    painting,
    result,
    currentRoundIndex,
  } = useGame();

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 8,
      zoomControl: true,
    });

    // Constrain map panning to the world bounds so the map stays within screen
    try {
      const worldBounds = L.latLngBounds([-90, -180], [90, 180]);
      map.setMaxBounds(worldBounds);
      // how strictly to enforce maxBounds when panning
      (map.options as any).maxBoundsViscosity = 0.5;
    } catch (e) {
      // ignore if setMaxBounds isn't available for some reason
    }

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    // Add resize observer to handle map visibility changes
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current?.invalidateSize();
        }, 100);
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle map clicks to place pins
  useEffect(() => {
    if (!mapRef.current || gameState !== 'playing') return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const location: Location = { lat: e.latlng.lat, lng: e.latlng.lng };
      // Single guess pin for current round
      setGuessPin(location);
    };

    mapRef.current.on('click', handleMapClick);

    return () => {
      mapRef.current?.off('click', handleMapClick);
    };
  }, [gameState, setGuessPin]);

  // Update guess pin marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (guessMarkerRef.current) {
      mapRef.current.removeLayer(guessMarkerRef.current);
      guessMarkerRef.current = null;
    }

    if (guessPin.location) {
      const isCorrect = gameState === 'submitted' && result?.correct;
      const pinColor = isCorrect ? 'green' : 'lightBrown';
      const roundLabel = painting ? painting.rounds[currentRoundIndex]?.description || 'Guess' : 'Guess';
      const pinLabel = isCorrect ? '✓ Correct!' : `Guess: ${roundLabel}`;

      const marker = L.marker([guessPin.location.lat, guessPin.location.lng], {
        icon: createPinIcon(pinColor, pinLabel),
        draggable: gameState === 'playing',
      }).addTo(mapRef.current);

      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        setGuessPin({ lat: newPos.lat, lng: newPos.lng });
      });

      guessMarkerRef.current = marker;
    }
  }, [guessPin.location, gameState, result, setGuessPin, painting, currentRoundIndex]);


  // Handle provenance visualization (journey line)
  useEffect(() => {
    if (!mapRef.current || !painting) return;

    // Only draw or update the line when we're in a state to show it
    if (gameState === 'submitted' || gameState === 'playing') {
      console.log('Drawing provenance line', { currentRoundIndex, gameState });

      // Draw the journey line up to previous location

      var provenanceLocations = []
      if (gameState === 'submitted'){
        provenanceLocations = painting.rounds.slice(0, currentRoundIndex+1).map(round => round.location);
      } else {
        provenanceLocations = painting.rounds.slice(0, currentRoundIndex).map(round => round.location);
      }
      
      console.log('Provenance locations:', { 
        locations: provenanceLocations, 
        roundIndex: currentRoundIndex,
        totalRounds: painting.rounds.length,
        hasEnoughPoints: provenanceLocations.length >= 1
      });
      
      if (provenanceLocations.length >= 1) {
        // Clear any existing line before drawing new one
        if (provenanceLineRef.current) {
          mapRef.current.removeLayer(provenanceLineRef.current);
          provenanceLineRef.current = null;
        }
      const line = L.polyline(
        provenanceLocations.map(loc => [loc.lat, loc.lng]),
        { 
          color: '#FF4B4B', // Red color for provenance
          weight: 3,
          opacity: 0.8,
          dashArray: '10,10',
        }
      ).addTo(mapRef.current);
      
      provenanceLineRef.current = line;
    }

    // Cleanup function to remove lines and markers when unmounting or painting changes
    return () => {
      if (provenanceLineRef.current) {
        mapRef.current?.removeLayer(provenanceLineRef.current);
        provenanceLineRef.current = null;
      }
      correctMarkersRef.current.forEach(marker => mapRef.current?.removeLayer(marker));
      correctMarkersRef.current = [];
    };
  }}, [painting, currentRoundIndex, gameState]);

  // Handle guess lines and current round visualization
  useEffect(() => {
    if (!mapRef.current || !painting || gameState !== 'submitted' || !result) return;

    // Clear only the guess lines
    resultLinesRef.current.forEach((line) => mapRef.current?.removeLayer(line));
    resultLinesRef.current = [];

    // Draw line from user's guess to the true location for the current sub-round
    if (guessPin.location) {
      const trueLoc = painting.rounds[currentRoundIndex]?.location;
      if (trueLoc) {
        const userToTrue = L.polyline(
          [
            [guessPin.location.lat, guessPin.location.lng],
            [trueLoc.lat, trueLoc.lng],
          ],
          { color: '#8B6F47', weight: 3, opacity: 0.8, dashArray: '5,6' }
        ).addTo(mapRef.current!);
        resultLinesRef.current.push(userToTrue);

        // If guess was incorrect, show the true location marker
        if (!result.correct) {
          const correctMarker = L.marker([trueLoc.lat, trueLoc.lng], { icon: createPinIcon('green', '✓ Answer') }).addTo(mapRef.current!);
          correctMarkersRef.current.push(correctMarker);
        }
      }
    }
  }, [gameState, painting, currentRoundIndex]);

  // Animate boat with painting miniature along journey path
  useEffect(() => {
    if (!mapRef.current || !painting || gameState !== 'submitted') return;

    // We no longer animate a ship. The animated provenance reveal is handled
    // in the provenance drawing effect above.
    return;
  }, [gameState, painting, guessPin, currentRoundIndex]);

  // Clear all markers and lines when transitioning to next painting
  useEffect(() => {
    if (gameState === 'loading' && mapRef.current) {
      console.log('Clearing on loading state');
      // Clear result lines
      resultLinesRef.current.forEach(line => mapRef.current?.removeLayer(line));
      resultLinesRef.current = [];

      // Clear guess markers only
      if (guessMarkerRef.current) {
        mapRef.current.removeLayer(guessMarkerRef.current);
        guessMarkerRef.current = null;
      }

      // Clear any animated provenance and cancel animations
      if (animatedProvenanceRef.current) {
        mapRef.current.removeLayer(animatedProvenanceRef.current);
        animatedProvenanceRef.current = null;
      }
      if (provenanceLineRef.current) {
        mapRef.current.removeLayer(provenanceLineRef.current);
        provenanceLineRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [gameState]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full z-0 map-fill-parent" />
      {/* Overlay StoryPanel as a side panel on the bottom left */}
      <div className="absolute bottom-4 left-4 z-10 max-w-xs w-full">
        <StoryPanel />
      </div>
    </div>
  );
};
