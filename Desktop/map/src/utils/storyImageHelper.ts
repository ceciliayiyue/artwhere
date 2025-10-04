export interface StoryImageResult {
  emoji: string;
  altText: string;
  backgroundColor: string;
}

interface KeywordMapping {
  keywords: string[];
  emoji: string;
  altText: string;
  backgroundColor: string;
}

const KEYWORD_MAPPINGS: KeywordMapping[] = [
  {
    keywords: ['stolen', 'theft', 'stole', 'robbed', 'heist', 'burglar'],
    emoji: '🚨',
    altText: 'Stolen artwork',
    backgroundColor: 'from-red-100 to-red-200',
  },
  {
    keywords: ['ship', 'sailed', 'exported', 'voyage', 'ocean', 'sea', 'boat', 'vessel'],
    emoji: '🚢',
    altText: 'Transported by ship',
    backgroundColor: 'from-blue-100 to-blue-200',
  },
  {
    keywords: ['war', 'battle', 'conflict', 'wwii', 'nazi', 'soldier', 'military'],
    emoji: '⚔️',
    altText: 'War-related event',
    backgroundColor: 'from-gray-100 to-gray-300',
  },
  {
    keywords: ['sold', 'auction', 'purchased', 'bought', 'sale', 'collector'],
    emoji: '💰',
    altText: 'Sold or auctioned',
    backgroundColor: 'from-yellow-100 to-yellow-200',
  },
  {
    keywords: ['donated', 'gift', 'bequeath', 'bequest', 'donation'],
    emoji: '🎁',
    altText: 'Donated or gifted',
    backgroundColor: 'from-pink-100 to-pink-200',
  },
  {
    keywords: ['museum', 'gallery', 'exhibition', 'louvre', 'moma'],
    emoji: '🏛️',
    altText: 'Museum or gallery',
    backgroundColor: 'from-purple-100 to-purple-200',
  },
  {
    keywords: ['fire', 'destroyed', 'damaged', 'burned', 'destroyed'],
    emoji: '🔥',
    altText: 'Fire or destruction',
    backgroundColor: 'from-orange-100 to-orange-200',
  },
  {
    keywords: ['restored', 'repaired', 'conservation', 'cleaned', 'renovation'],
    emoji: '🔧',
    altText: 'Restored or repaired',
    backgroundColor: 'from-green-100 to-green-200',
  },
  {
    keywords: ['discovered', 'found', 'uncovered', 'rediscovered', 'search'],
    emoji: '🔍',
    altText: 'Discovered or found',
    backgroundColor: 'from-indigo-100 to-indigo-200',
  },
  {
    keywords: ['royal', 'king', 'queen', 'palace', 'crown', 'nobility'],
    emoji: '👑',
    altText: 'Royal ownership',
    backgroundColor: 'from-amber-100 to-amber-200',
  },
  {
    keywords: ['return', 'returned', 'recovered', 'repatriated'],
    emoji: '↩️',
    altText: 'Returned or recovered',
    backgroundColor: 'from-teal-100 to-teal-200',
  },
];

const DEFAULT_IMAGE: StoryImageResult = {
  emoji: '📖',
  altText: 'Painting story',
  backgroundColor: 'from-gray-100 to-gray-200',
};

/**
 * Analyzes story text and returns appropriate emoji and styling
 * based on keywords found in the text
 */
export function getStoryImage(story?: string): StoryImageResult {
  if (!story) {
    return DEFAULT_IMAGE;
  }

  const storyLower = story.toLowerCase();

  // Find the first matching keyword category
  for (const mapping of KEYWORD_MAPPINGS) {
    for (const keyword of mapping.keywords) {
      if (storyLower.includes(keyword)) {
        return {
          emoji: mapping.emoji,
          altText: mapping.altText,
          backgroundColor: mapping.backgroundColor,
        };
      }
    }
  }

  // No keywords matched, return default
  return DEFAULT_IMAGE;
}

/**
 * Get multiple relevant emojis if story contains multiple event types
 */
export function getStoryEmojis(story?: string, maxEmojis = 3): StoryImageResult[] {
  if (!story) {
    return [DEFAULT_IMAGE];
  }

  const storyLower = story.toLowerCase();
  const foundEmojis: StoryImageResult[] = [];

  for (const mapping of KEYWORD_MAPPINGS) {
    for (const keyword of mapping.keywords) {
      if (storyLower.includes(keyword)) {
        foundEmojis.push({
          emoji: mapping.emoji,
          altText: mapping.altText,
          backgroundColor: mapping.backgroundColor,
        });
        break; // Only add each category once
      }
    }

    if (foundEmojis.length >= maxEmojis) {
      break;
    }
  }

  return foundEmojis.length > 0 ? foundEmojis : [DEFAULT_IMAGE];
}
