# Painting Location Guessing Game - Frontend UI

A beautiful, interactive React + TypeScript web application for a painting location guessing game. Players guess where famous paintings were created and where they're currently located using an interactive map interface.

## Features

### ✨ Implemented Components

#### 🎨 **Painting Display Component**
- Large, elegant image display of paintings
- Shows title and artist name
- Card-style presentation with smooth animations
- Loading states with spinner
- Responsive image handling with fallback

#### 🗺️ **Interactive Map Component (Leaflet.js)**
- Full world map view with OpenStreetMap tiles
- Click-to-place pin system
- Smooth pan and zoom controls
- Draggable pins before submission
- Visual feedback for pin placement
- Result lines showing distance from guess to correct answer

#### 📍 **Pin System**
- **BLUE PIN**: "Where was it created?"
- **RED PIN**: "Where is it now?"
- Custom SVG pin icons with labels
- Drag-and-drop functionality
- Visual distinction between pin types
- Pin reset functionality

#### 📋 **Instructions Panel**
- Collapsible design
- Step-by-step gameplay guidance
- Color-coded instructions matching pin colors
- Smooth slide-down animation
- Can be hidden after first game

#### 🎮 **Control Panel**
- Submit button (disabled until both pins placed)
- Next painting button (after submission)
- Reset pins button
- Large, prominent score display with animation
- Round counter
- Helpful status messages

#### 🎯 **Results Display Component**
- Animated overlay showing results
- Success/partial/failure states with different colors
- Distance indicators (in km) for incorrect guesses
- Checkmarks/X marks for each guess
- Confetti animation for perfect scores
- Smooth entrance/exit animations

#### 📖 **Story Panel Component**
- Slides up from bottom when user gets answer wrong
- Placeholder for painting story/history
- Placeholder for story image
- Shows correct location information
- Smooth animation and styling
- Easy to update with real content

### 🎭 Animations & Polish

- Pin drop animations with bounce effect
- Dotted line drawing from guess to correct answer
- Success confetti for perfect scores
- Smooth state transitions using Framer Motion
- Score increment animation
- Loading spinners and skeleton states
- Slide-up/down animations for panels

### 🎨 Styling

- **Tailwind CSS** for utility-first styling
- Modern, clean design aesthetic (Duolingo/GeoGuessr inspired)
- Professional color scheme:
  - Primary: Indigo (#4F46E5)
  - Secondary: Green (#10B981)
  - Accent: Amber (#F59E0B)
- Gradient backgrounds
- Custom scrollbars
- Responsive design (desktop and tablet)
- WCAG AA accessible color contrasts

### 🏗️ Architecture

#### State Management
- **React Context API** (`GameContext`)
- Centralized game state
- Painting data
- Pin locations
- Game state (playing, submitted, loading)
- Score and round tracking

#### Type Safety
- Full TypeScript implementation
- Custom types for:
  - `Painting`
  - `Location`
  - `Pin`
  - `GameResult`
  - `GameState`

#### Project Structure
```
src/
├── components/          # All React components
│   ├── PaintingDisplay.tsx
│   ├── GameMap.tsx
│   ├── InstructionsPanel.tsx
│   ├── ControlPanel.tsx
│   ├── ResultsDisplay.tsx
│   ├── StoryPanel.tsx
│   └── index.ts
├── contexts/           # React Context for state
│   └── GameContext.tsx
├── types/             # TypeScript type definitions
│   └── game.ts
├── utils/             # Utility functions
│   └── distance.ts
├── App.tsx            # Main app component
└── index.css          # Global styles + Tailwind
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm preview
```

## 📦 Dependencies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Leaflet.js** - Interactive maps
- **Framer Motion** - Smooth animations
- **React Confetti** - Celebration effects

## 🎮 How to Play

1. A painting is displayed on the left/top
2. Click the map to place the **BLUE pin** where you think the painting was created
3. Click the map again to place the **RED pin** where you think the painting is now
4. Click "Submit Guess" to see results
5. If wrong, read the story about what happened to the painting
6. Click "Next Painting" to continue

## 🎯 Game Mechanics

- **Scoring**: 1 point for each correct location (max 2 per round)
- **Accuracy**: Guesses within 100km are considered correct
- **Feedback**:
  - Green overlay + confetti = both correct
  - Yellow overlay = one correct
  - Red overlay = both wrong
- **Distance**: Shows how far off your guess was in kilometers
- **Story**: Appears when you miss, explaining the painting's journey

## 🎨 Component Documentation

### PaintingDisplay
Displays the current painting with title and artist information.

**Props**: None (uses context)

**State from Context**:
- `painting`: Current painting data
- `gameState`: Loading/playing/submitted

### GameMap
Interactive Leaflet map with pin placement and result visualization.

**Props**: None (uses context)

**Features**:
- Click to place pins
- Drag pins before submission
- Shows result lines after submission
- Custom pin icons

### InstructionsPanel
Collapsible panel with game instructions.

**Props**: None (uses context)

**State from Context**:
- `showInstructions`: Visibility toggle

### ControlPanel
Game controls and score display.

**Props**: None (uses context)

**Features**:
- Submit/Reset/Next buttons
- Score animation
- Round counter
- Status messages

### ResultsDisplay
Overlay showing game results after submission.

**Props**: None (uses context)

**Features**:
- Confetti for perfect score
- Color-coded feedback
- Distance information
- Animated entrance

### StoryPanel
Bottom panel with painting history (shown on wrong answers).

**Props**: None (uses context)

**Features**:
- Slide-up animation
- Story text (placeholder ready)
- Story image (placeholder ready)
- Correct location info

## 🔌 API Integration (Ready for Backend)

The app is designed to easily integrate with a backend API. Currently uses mock data in `App.tsx`:

```typescript
// Replace this mock data with API calls
const mockPaintings: Painting[] = [...]

// In GameContent component, replace:
const loadPainting = async () => {
  setGameState('loading');
  // Replace with: const data = await fetch('/api/paintings')
  const paintingIndex = (round - 1) % mockPaintings.length;
  setPainting(mockPaintings[paintingIndex]);
  setGameState('playing');
};
```

### Expected API Response Format

```typescript
{
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  createdLocation: {
    lat: number;
    lng: number;
    name?: string;
  };
  currentLocation: {
    lat: number;
    lng: number;
    name?: string;
  };
  story?: string;
  storyImageUrl?: string;
}
```

## 🎨 Customization

### Colors
Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#4F46E5',    // Main brand color
      secondary: '#10B981',   // Success/positive
      accent: '#F59E0B',      // Highlights
    }
  }
}
```

### Accuracy Threshold
Edit `src/utils/distance.ts`:

```typescript
export function isGuessCorrect(
  guess: Location,
  actual: Location,
  threshold = 100  // Change this value (km)
): boolean
```

### Map Tiles
Edit `src/components/GameMap.tsx`:

```typescript
L.tileLayer('YOUR_TILE_URL/{z}/{x}/{y}.png', {
  attribution: 'YOUR_ATTRIBUTION',
}).addTo(map);
```

## 📱 Responsive Design

- **Desktop**: Side-by-side layout (painting left, map right)
- **Tablet/Mobile**: Stacked layout (painting top, map bottom)
- **Breakpoint**: `lg` (1024px)

## ✅ Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- WCAG AA color contrast ratios
- Screen reader friendly

## 🐛 Known Issues / Future Enhancements

- [ ] Mobile touch support could be improved
- [ ] Add sound effects for feedback
- [ ] Add difficulty levels (different accuracy thresholds)
- [ ] Add leaderboard
- [ ] Add timer/speed bonus
- [ ] Add hints system
- [ ] Add painting categories/filters
- [ ] Add multiplayer support

## 📄 License

MIT

## 🤝 Contributing

This is the frontend UI component. API integration should be handled by a separate backend service.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
