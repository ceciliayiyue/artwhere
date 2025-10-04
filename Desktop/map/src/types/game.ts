export interface Painting {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  createdLocation: Location;
  currentLocation: Location;
  story?: string;
  storyImageUrl?: string;
}

export interface Location {
  lat: number;
  lng: number;
  name?: string;
}

export interface Pin {
  type: 'created' | 'current';
  location: Location | null;
}

export interface GameResult {
  createdCorrect: boolean;
  currentCorrect: boolean;
  createdDistance?: number;
  currentDistance?: number;
}

export type GameState = 'playing' | 'submitted' | 'loading';
