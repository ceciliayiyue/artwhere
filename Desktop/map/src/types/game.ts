export interface Location {
  lat: number;
  lng: number;
  name?: string;
}

export interface RoundData {
  // Human-readable prompt for the round, e.g. "Artist birthplace", "Currently on display at"
  description: string;
  // The true location for this round
  location: Location;
}

export interface Painting {
  id: string;
  title: string;
  artist: string;
  imageUrl?: string;
  // A list of rounds to play for this painting. Each round has its own description and true location.
  rounds: RoundData[];
  story?: string;
  storyImageUrl?: string;
}

export interface Pin {
  // Single guess pin used for the current round
  type: 'guess';
  location: Location | null;
}

export interface GameResult {
  // Whether the user's guess for the current round was considered correct
  correct: boolean;
  // Distance (km) when incorrect
  distance?: number;
}

export type GameState = 'playing' | 'submitted' | 'loading' | 'finished';
