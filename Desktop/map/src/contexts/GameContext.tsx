import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Painting, Pin, GameResult, GameState, Location } from '../types/game';

interface GameContextType {
  painting: Painting | null;
  setPainting: (painting: Painting | null) => void;
  guessPin: Pin;
  setGuessPin: (location: Location | null) => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  result: GameResult | null;
  setResult: (result: GameResult | null) => void;
  score: number;
  setScore: (score: number) => void;
  // Current painting round index (0-based) within the painting.rounds array
  currentRoundIndex: number;
  setCurrentRoundIndex: Dispatch<SetStateAction<number>>;
  round: number; // overall game round counter (1-based)
  setRound: (round: number) => void;
  resetPins: () => void;
  showInstructions: boolean;
  setShowInstructions: (show: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [painting, setPainting] = useState<Painting | null>(null);
  const [guessPin, setGuessPinState] = useState<Pin>({ type: 'guess', location: null });
  const [gameState, setGameState] = useState<GameState>('loading');
  const [result, setResult] = useState<GameResult | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  const setGuessPin = (location: Location | null) => {
    setGuessPinState({ type: 'guess', location });
  };

  const resetPins = () => {
    setGuessPin(null);
  };

  const value: GameContextType = {
    painting,
    setPainting,
    guessPin,
    setGuessPin,
    gameState,
    setGameState,
    result,
    setResult,
    score,
    setScore,
    currentRoundIndex,
    setCurrentRoundIndex,
    round,
    setRound,
    resetPins,
    showInstructions,
    setShowInstructions,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
