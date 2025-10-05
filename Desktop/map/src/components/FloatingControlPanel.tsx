import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { calculateDistance, isGuessCorrect } from '../utils/distance';
import type { GameResult } from '../types/game';

export const FloatingControlPanel: React.FC = () => {
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

  const canSubmit = !!guessPin.location && gameState === 'playing';

  const handleSubmit = () => {
    if (!canSubmit || !painting) return;

    const trueLoc = painting.rounds[currentRoundIndex]?.location;
    if (!trueLoc || !guessPin.location) return;

    const correct = isGuessCorrect(guessPin.location, trueLoc);
    const distance = !correct ? calculateDistance(guessPin.location, trueLoc) : undefined;

    const result: GameResult = {
      correct,
      distance,
    };

    setResult(result);
    setGameState('submitted');

    // Update score: 1 point for a correct guess
    const pointsEarned = correct ? 1 : 0;
    setScore(score + pointsEarned);
  };

  const handleNext = () => {
    // Advance to next sub-round if present, otherwise advance to next painting
    resetPins();
    setResult(null);
    if (painting) {
      const nextIndex = currentRoundIndex + 1;
      if (nextIndex < painting.rounds.length) {
        setCurrentRoundIndex((prev) => prev + 1);
        setGameState('loading');
        return;
      }
    }
    // otherwise move to next painting
    setRound(round + 1);
    setCurrentRoundIndex(0);
    setGameState('loading');
  };

  const handleReset = () => {
    resetPins();
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute top-4 right-4 z-20 bg-green-600 rounded-2xl p-4 shadow-xl"
    >
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="text-center flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide font-outfit text-white/80 mb-1">Score</p>
          <motion.p
            key={score}
            initial={{ scale: 1.2, color: '#10B981' }}
            animate={{ scale: 1, color: '#FFFFEB' }}
            className="text-2xl font-outfit font-black text-white"
          >
            {score}
          </motion.p>
        </div>
        <div className="w-px h-8 bg-white/30 mx-2"></div>
        <div className="text-center flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide font-outfit text-white/80 mb-1">Round</p>
          <p className="text-2xl font-outfit font-black text-white">{round}</p>
        </div>
      </div>

      <div className="flex space-x-2">
        {gameState === 'playing' && (
          <>
            <button
              onClick={handleReset}
              disabled={!guessPin.location}
              className="px-3 py-2 rounded-xl hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-outfit font-bold text-xs uppercase bg-white/20 text-white"
            >
              Reset
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`px-4 py-2 rounded-xl font-outfit font-black text-sm uppercase transition-all transform ${
                canSubmit
                  ? 'bg-white text-green-600 hover:scale-105 hover:shadow-lg'
                  : 'bg-white/20 text-white/50 cursor-not-allowed'
              }`}
            >
              Submit
            </button>
          </>
        )}

        {gameState === 'submitted' && (
          <button
            onClick={handleNext}
            className="px-4 py-2 rounded-xl font-outfit font-black text-sm uppercase bg-white text-green-600 hover:scale-105 transition-transform shadow-lg"
          >
            Next →
          </button>
        )}
      </div>

      {gameState === 'playing' && (
        <div className="text-xs text-center font-medium font-outfit text-white/90 mt-6">
          {!guessPin.location && (
            <p>Place a pin on the map.</p>
          )}
          {guessPin.location && (
            <p className="text-green-300 font-bold">Ready to submit! 🎨</p>
          )}
        </div>
      )}
    </motion.div>
  );
};
