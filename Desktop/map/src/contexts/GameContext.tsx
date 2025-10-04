import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Painting, Pin, GameResult, GameState, Location } from '../types/game';

interface GameContextType {
  painting: Painting | null;
  setPainting: (painting: Painting | null) => void;
  createdPin: Pin;
  currentPin: Pin;
  setCreatedPin: (location: Location | null) => void;
  setCurrentPin: (location: Location | null) => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  result: GameResult | null;
  setResult: (result: GameResult | null) => void;
  score: number;
  setScore: (score: number) => void;
  round: number;
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
  const [createdPin, setCreatedPinState] = useState<Pin>({ type: 'created', location: null });
  const [currentPin, setCurrentPinState] = useState<Pin>({ type: 'current', location: null });
  const [gameState, setGameState] = useState<GameState>('loading');
  const [result, setResult] = useState<GameResult | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [showInstructions, setShowInstructions] = useState(true);

  const setCreatedPin = (location: Location | null) => {
    setCreatedPinState({ type: 'created', location });
  };

  const setCurrentPin = (location: Location | null) => {
    setCurrentPinState({ type: 'current', location });
  };

  const resetPins = () => {
    setCreatedPin(null);
    setCurrentPin(null);
  };

  const value: GameContextType = {
    painting,
    setPainting,
    createdPin,
    currentPin,
    setCreatedPin,
    setCurrentPin,
    gameState,
    setGameState,
    result,
    setResult,
    score,
    setScore,
    round,
    setRound,
    resetPins,
    showInstructions,
    setShowInstructions,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
