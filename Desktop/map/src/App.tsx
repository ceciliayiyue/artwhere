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

// // Mock painting data - in real app, this would come from API
// const mockPaintings: Painting[] = [
//   {
//     id: '1',
import rawData from '../../../scraping_utils/data.json';
import generateMockPaintingsFromData, { sampleMockPaintings } from './utils/dataToMock';
//     title: 'Mona Lisa',
//     artist: 'Leonardo da Vinci',
const mockPaintings: Painting[] = sampleMockPaintings(generateMockPaintingsFromData(rawData), 5);

const GameContent: React.FC = () => {
  const { painting, setPainting, setGameState, gameState, round, setCurrentRoundIndex } = useGame();

  useEffect(() => {
    // Simulate loading a painting
    const loadPainting = async () => {
      setGameState('loading');
      // Get painting based on round (cycle through mock data)
      const paintingIndex = (round - 1) % mockPaintings.length;
      const p = mockPaintings[paintingIndex];
      // Only reset currentRoundIndex when the painting actually changes
      if (!painting || painting.id !== p.id) {
        setCurrentRoundIndex(0);
      }
      setPainting(p);
      setGameState('playing');
    };

    if (gameState === 'loading') {
      loadPainting();
    }
  }, [gameState, round, setPainting, setGameState, painting, setCurrentRoundIndex]);

  return (
    <div className="h-screen w-full flex flex-col bg-purple-texture">
      <InstructionsPanel />

          <div className="flex justify-center flex-1">
        <div className="w-full md:w-[92%] flex flex-col h-full">
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
          <div className="flex justify-center -mt-4 mb-4">
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
            <div className="flex flex-col md:flex-row flex-1 min-h-0 mb-8">
            {/* Left Side: Painting Display (smaller to make map larger) */}
            <div className="w-full md:w-[15%] lg:w-[12%] flex flex-col">
              <div className="min-h-[200px] md:min-h-0">
                <PaintingDisplay />
              </div>
              {/* Story Panel - Below Painting */}
              <div className="mt-4 mr-4">
                <StoryPanel />
              </div>
            </div>

            {/* Map - Right/Bottom with Floating Control Panel (larger) */}
            <div className="flex-1 md:w-[85%] lg:w-[88%] min-h-0 relative flex flex-col">
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
