import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { calculateDistance, isGuessCorrect } from '../utils/distance';
import type { GameResult } from '../types/game';

export const ControlPanel: React.FC = () => {
  const {
    guessPin,
    gameState,
    setGameState,
    painting,
    setResult,
    score,
    setScore,
    round,
    setRound,
    resetPins,
    currentRoundIndex,
    setCurrentRoundIndex,
  } = useGame();

  const canSubmit = guessPin.location && gameState === 'playing' && !!painting;

  const handleSubmit = () => {
    if (!canSubmit || !painting) return;

    const trueLocation = painting.rounds[currentRoundIndex].location;
    const correct = isGuessCorrect(guessPin.location!, trueLocation);
    const resultObj: GameResult = {
      correct,
      distance: !correct ? calculateDistance(guessPin.location!, trueLocation) : undefined,
    };

    setResult(resultObj);
    setGameState('submitted');

    // Update score: 1 point for correct guess
    const pointsEarned = correct ? 1 : 0;
    setScore(score + pointsEarned);
  };

  const handleNext = () => {
    // advance to next sub-round or painting
    resetPins();
    setResult(null);
    // Advance sub-round within the same painting if available
    if (painting) {
      const nextIndex = currentRoundIndex + 1;
      if (nextIndex < painting.rounds.length) {
        setCurrentRoundIndex((prev) => prev + 1);
        setGameState('loading');
        return;
      }
    }
    // Otherwise advance to next painting
    setRound(round + 1);
    setCurrentRoundIndex(0);
    setGameState('loading');
  };

  const handleReset = () => {
    resetPins();
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-3 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3 sm:mb-4">
        <div className="flex items-center space-x-4 sm:space-x-6 justify-center">
          <div className="text-center">
            <p className="text-xs sm:text-base mb-1 sm:mb-2 font-semibold uppercase tracking-wide font-druk" style={{ color: '#FFFFEB' }}>Score</p>
            <motion.p
              key={score}
              initial={{ scale: 1.5, color: '#10B981' }}
              animate={{ scale: 1, color: '#FFFFEB' }}
              className="text-4xl sm:text-6xl font-druk font-black"
              style={{ color: '#FFFFEB' }}
            >
              {score}
            </motion.p>
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-base mb-1 sm:mb-2 font-semibold uppercase tracking-wide font-druk" style={{ color: '#FFFFEB' }}>Round</p>
            <p className="text-3xl sm:text-4xl font-druk font-black" style={{ color: '#FFFFEB' }}>{round}</p>
          </div>
          <div className="text-center ml-6">
            <p className="text-xs sm:text-base mb-1 sm:mb-2 font-semibold uppercase tracking-wide font-druk" style={{ color: '#FFFFEB' }}>Stage</p>
            <p className="text-sm sm:text-base font-druk font-black" style={{ color: '#FFFFEB' }}>{painting ? painting.rounds[currentRoundIndex].description : ''}</p>
          </div>
        </div>

        <div className="flex space-x-2 sm:space-x-3">
          {gameState === 'playing' && (
            <>
              <button
                onClick={handleReset}
                disabled={!guessPin.location}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-2xl hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-druk font-bold text-sm sm:text-base uppercase"
                style={{ backgroundColor: '#FFFFEB', color: '#5EA85E' }}
              >
                Reset
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`flex-1 sm:flex-none px-5 sm:px-8 py-2 sm:py-3 rounded-2xl font-druk font-black text-base sm:text-lg uppercase transition-all transform ${
                  canSubmit
                    ? 'hover:scale-105 hover:shadow-lg'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                style={{ backgroundColor: '#FFFFEB', color: '#5EA85E' }}
              >
                Submit
              </button>
            </>
          )}

          {gameState === 'submitted' && (
            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 rounded-2xl font-druk font-black text-base sm:text-lg uppercase hover:scale-105 transition-transform shadow-lg"
              style={{ backgroundColor: '#FFFFEB', color: '#5EA85E' }}
            >
              Next →
            </button>
          )}
        </div>
      </div>

      {gameState === 'playing' && (
        <div className="text-sm sm:text-base text-center font-medium font-druk" style={{ color: '#FFFFEB' }}>
          {!guessPin.location && (
            <p>Place a pin on the map to answer: <span className="font-bold">{painting ? painting.rounds[currentRoundIndex].description : ''}</span></p>
          )}
          {guessPin.location && (
            <p className="text-green-600 font-bold text-base sm:text-lg">Ready to submit your guess! �</p>
          )}
        </div>
      )}
    </motion.div>
  );
};
