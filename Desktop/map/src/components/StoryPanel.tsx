import React from 'react';
// framer-motion not needed in this lightweight panel
import { useGame } from '../contexts/GameContext';

export const StoryPanel: React.FC = () => {
  const { gameState, result, painting, currentRoundIndex } = useGame();

  const shouldShow = gameState === 'submitted' && result && !result.correct;

  if (!shouldShow) return null;

  return (
    <div className="w-full mb-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg max-w-sm">
        <div className="text-center mb-3">
          <h3 className="text-xl font-bold text-gray-800 font-druk">
            {painting?.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Artist: {painting?.artist}
          </p>
        </div>
        <div className="space-y-2 text-gray-700">
          <p className="text-xs leading-relaxed">
            {painting?.story || (
              <span className="italic text-gray-500">
                [This is a placeholder for the painting's story. The story will explain
                the journey of this artwork - where it was created, significant events
                in its history, how it moved from place to place, and where it resides
                today. This could include details about theft, sales, donations, wars,
                or other historical events that affected the painting's location.]
              </span>
            )}
          </p>

              {painting && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="text-xs sm:text-base text-blue-800 font-semibold font-druk">
                    <strong className="text-sm sm:text-lg">Answer — {painting.rounds[currentRoundIndex].description}:</strong> {painting.rounds[currentRoundIndex].location.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
  );
};
