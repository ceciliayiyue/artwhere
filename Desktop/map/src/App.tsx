import React, { useEffect } from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import { Header } from './components/Header';
import { GameIntro } from './components/GameIntro';
import { FloatingControlPanel } from './components/FloatingControlPanel';
import { PaintingDisplay } from './components/PaintingDisplay';
import { GameMap } from './components/GameMap';
import { InstructionsPanel } from './components/InstructionsPanel';
import { StoryPanel } from './components/StoryPanel';
import type { Painting } from './types/game';

// Mock painting data - in real app, this would come from API
const mockPaintings: Painting[] = [
  {
    id: '1',
    title: 'Mona Lisa',
    artist: 'Leonardo da Vinci',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/405px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    createdLocation: { lat: 43.7696, lng: 11.2558, name: 'Florence, Italy' },
    currentLocation: { lat: 48.8606, lng: 2.3376, name: 'Louvre Museum, Paris, France' },
    story: 'The Mona Lisa was painted by Leonardo da Vinci in Florence, Italy between 1503 and 1519. After Leonardo\'s death, the painting entered the French royal collection and has been on permanent display at the Louvre Museum in Paris since 1797. It was briefly stolen in 1911 by an Italian handyman who believed it should be returned to Italy, but was recovered two years later.',
  },
  {
    id: '2',
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/525px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    createdLocation: { lat: 43.7791, lng: 4.6361, name: 'Saint-Rémy-de-Provence, France' },
    currentLocation: { lat: 40.7614, lng: -73.9776, name: 'MoMA, New York, USA' },
    story: 'Vincent van Gogh painted The Starry Night in June 1889 while staying at the Saint-Paul-de-Mausole asylum in Saint-Rémy-de-Provence, France. The painting depicts the view from his asylum room window. After van Gogh\'s death in 1890, the painting changed hands several times before being acquired by the Museum of Modern Art in New York in 1941.',
  },
  {
    id: '3',
    title: 'The Scream',
    artist: 'Edvard Munch',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/440px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg',
    createdLocation: { lat: 59.9139, lng: 10.7522, name: 'Oslo, Norway' },
    currentLocation: { lat: 59.9139, lng: 10.7522, name: 'National Museum, Oslo, Norway' },
    story: 'Edvard Munch created The Scream in Oslo, Norway in 1893. This iconic painting has remained in Norway throughout its history. There are actually four versions of The Scream - two pastels and two paintings. The most famous version is housed in the National Museum in Oslo. The painting was stolen twice (in 1994 and 2004) but was recovered both times and returned to Norway.',
  },
];

const GameContent: React.FC = () => {
  const { setPainting, setGameState, gameState, round } = useGame();

  useEffect(() => {
    // Simulate loading a painting
    const loadPainting = async () => {
      setGameState('loading');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get painting based on round (cycle through mock data)
      const paintingIndex = (round - 1) % mockPaintings.length;
      setPainting(mockPaintings[paintingIndex]);
      setGameState('playing');
    };

    if (gameState === 'loading') {
      loadPainting();
    }
  }, [gameState, round, setPainting, setGameState]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-purple-texture">
      <InstructionsPanel />

      <div className="flex justify-center">
        <div className="w-full md:w-[85%] flex flex-col">
          {/* Header with Logo centered and GameIntro on the right */}
          <div className="flex items-center justify-between mb-0">
            <div className="flex-1"></div>
            <div className="flex-1 flex justify-center">
              <Header />
            </div>
            <div className="flex-1 flex justify-end mt-2">
              <GameIntro />
            </div>
          </div>

          {/* Intro text underneath logo */}
          <div className="flex justify-center -mt-8 mb-1">
            <p className="text-lg font-bold text-center italic" style={{ 
              color: '#FFFFEB', 
              fontFamily: 'Georgia, serif',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              letterSpacing: '0.5px'
            }}>
              Discover where art was born and where it lives today! 🎨
            </p>
          </div>

          {/* Painting and Map Row */}
          <div className="flex flex-col md:flex-row min-h-[400px] md:min-h-[500px] mb-8">
            {/* Left Side: Painting Display */}
            <div className="w-full md:w-[25%] lg:w-[20%] flex flex-col">
              <div className="min-h-[200px] md:min-h-0">
                <PaintingDisplay />
              </div>
              {/* Story Panel - Below Painting */}
              <div className="mt-4 mr-4">
                <StoryPanel />
              </div>
            </div>

            {/* Map - Right/Bottom with Floating Control Panel */}
            <div className="flex-1 md:w-[75%] lg:w-[80%] min-h-[300px] relative">
              <GameMap />
              <FloatingControlPanel />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
