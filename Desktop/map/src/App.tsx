import React, { useEffect } from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import { Header } from './components/Header';
import { GameIntro } from './components/GameIntro';
import { FloatingControlPanel } from './components/FloatingControlPanel';
import { PaintingDisplay } from './components/PaintingDisplay';
import { GameMap } from './components/GameMap';
import { InstructionsPanel } from './components/InstructionsPanel';
import Spacer from './components/Spacer';
// StoryPanel intentionally not imported here; story content is shown in overlay or elsewhere
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
      <Spacer />
          {/* Header with Logo centered and GameIntro on the right */}
            <Header />
          {/* Full-width map band with portrait overlay */}
          <div className="map-band relative">
            <div className="map-band-inner relative map-fill-parent">
              <GameMap />
              <div className="portrait-overlay">
                <PaintingDisplay sidebar/>
              </div>
              <FloatingControlPanel />
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
