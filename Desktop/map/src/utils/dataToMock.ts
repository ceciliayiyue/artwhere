import type { Painting, RoundData, Location } from '../types/game';

/**
 * Helpers to convert the scraping_utils/data.json structure into the app's Painting[] shape.
 *
 * Usage:
 *
 * import rawData from '../../../scraping_utils/data.json';
 * import { generateMockPaintingsFromData, sampleMockPaintings } from './utils/dataToMock';
 *
 * const paintings = generateMockPaintingsFromData(rawData);
 * const sample = sampleMockPaintings(paintings, 5);
 *
 * Note: importing data.json directly into the frontend may require copying the JSON into the project
 * or bundler configuration depending on your setup; this module only handles conversion logic and
 * does not read files itself — it enforces that the information comes from the provided `data`.
 */

type RawData = { data?: any[] } | any;

function safeGetCoordinates(obj: any): Location | null {
  if (!obj) return null;
  // If the field is already an array of numbers [lat, lng]
  if (Array.isArray(obj) && obj.length >= 2 && typeof obj[0] === 'number') {
    return { lat: obj[0], lng: obj[1], name: undefined };
  }
  // If object has coordinates prop
  if (obj.coordinates && Array.isArray(obj.coordinates) && obj.coordinates.length >= 2) {
    return { lat: obj.coordinates[0], lng: obj.coordinates[1], name: obj.name || undefined };
  }
  return null;
}

function pickImage(item: any): string | undefined {
  if (!item) return undefined;
  if (item.image && typeof item.image === 'object' && item.image.image) return item.image.image;
  if (Array.isArray(item.image) && item.image.length && item.image[0].image) return item.image[0].image;
  return undefined;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Convert raw data.json object into Painting[] */
export function generateMockPaintingsFromData(raw: RawData): Painting[] {
  const items = (raw && raw.data) || [];
  const paintings: Painting[] = (items || []).map((item: any, idx: number) => {
    const id = (item.wikibase_article && item.wikibase_article.id) || `SAMPLE_${idx}`;
    const title = (item.wikibase_article && item.wikibase_article.title) || `Untitled ${idx}`;
    const artist =
      (Array.isArray(item.creator) && item.creator.length && item.creator[0].name) ||
      (item.creator && item.creator.name) ||
      'Unknown Artist';
    const imageUrl = pickImage(item) || undefined;

    // Round A: Artist birthplace
    let artistBirth: Location | null = null;
    if (Array.isArray(item.creator)) {
      for (const c of item.creator) {
        const coords = safeGetCoordinates(c.place_of_birth);
        if (coords) {
          artistBirth = coords;
          break;
        }
      }
    } else if (item.creator) {
      artistBirth = safeGetCoordinates(item.creator.place_of_birth);
    }

    // Round B: Location of creation (prefer explicit location_of_creation, fallback to country_of_origin)
    let creationLoc: Location | null = null;
    if (item.location_of_creation && Object.keys(item.location_of_creation || {}).length) {
      creationLoc = safeGetCoordinates(item.location_of_creation);
    }
    if (!creationLoc) creationLoc = safeGetCoordinates(item.country_of_origin);

    // Round C: Provenance - try owner coordinates or general location
    let provenanceLoc: Location | null = null;
    if (Array.isArray(item.owner)) {
      for (const o of item.owner) {
        const coords = safeGetCoordinates(o);
        if (coords) {
          provenanceLoc = coords;
          break;
        }
      }
    } else if (item.owner) {
      provenanceLoc = safeGetCoordinates(item.owner);
    }
    if (!provenanceLoc && item.location) {
      if (Array.isArray(item.location)) {
        for (const loc of item.location) {
          const coords = safeGetCoordinates(loc);
          if (coords) {
            provenanceLoc = coords;
            break;
          }
        }
      } else {
        provenanceLoc = safeGetCoordinates(item.location);
      }
    }

    // Round D: Currently located at (prefer item.location or owner[0])
    let currentLoc: Location | null = null;
    if (Array.isArray(item.location)) {
      for (const loc of item.location) {
        const coords = safeGetCoordinates(loc);
        if (coords) {
          currentLoc = coords;
          break;
        }
      }
    } else if (item.location) {
      currentLoc = safeGetCoordinates(item.location);
    }
    if (!currentLoc && Array.isArray(item.owner) && item.owner.length) {
      currentLoc = safeGetCoordinates(item.owner[0]);
    }

    const rounds: RoundData[] = [];
    if (artistBirth) rounds.push({
      description: `${artist}'s birthplace`,
      location: artistBirth,
      wikiLink: item.creator?.name ? `https://en.wikipedia.org/wiki/${item.creator.name.replace(/ /g, '_')}` : item.wikibase_article?.wikipedia_url || item.wikibase_article?.wiki_url || undefined
    });
    if (creationLoc) rounds.push({
      description: 'Location of creation',
      location: creationLoc,
      wikiLink:  item.location_of_creation?.name ? `https://en.wikipedia.org/wiki/${item.location_of_creation.name.replace(/ /g, '_')}` : item.wikibase_article?.wikipedia_url   || undefined
    });
    if (provenanceLoc) {
      let wikiLink: string | undefined;
      if (Array.isArray(item.owner)) {
        for (const o of item.owner) {
          if (o.wiki_url) {
            wikiLink = o.wiki_url;
            break;
          }
        }
      } else if (item.owner?.wiki_url) wikiLink = item.owner.wiki_url;
      rounds.push({
        description: `Location when ownership changed to ${provenanceLoc.name}`,
        location: provenanceLoc,
        wikiLink: provenanceLoc.name ? `https://en.wikipedia.org/wiki/${provenanceLoc.name.replace(/ /g, '_')}` : item.wikibase_article?.wikipedia_url || undefined
      });
    }
    if (currentLoc) {
      let wikiLink: string | undefined;
      if (Array.isArray(item.location)) {
        for (const loc of item.location) {
          if (loc.wiki_url) {
            wikiLink = loc.wiki_url;
            break;
          }
        }
      } else if (item.location?.wiki_url) wikiLink = item.location.wiki_url;
      if (!wikiLink && Array.isArray(item.owner) && item.owner.length && item.owner[0].wiki_url) {
        wikiLink = item.owner[0].wiki_url;
      }
      rounds.push({
        description: 'Currently located at',
        location: currentLoc,
        wikiLink: item.wikibase_article?.wikipedia_url || undefined
      });
    }
    if (!rounds.length) {
      const fallback = safeGetCoordinates(item.country_of_origin) || { lat: 0, lng: 0, name: 'Unknown' };
      rounds.push({
        description: 'Location (fallback)',
        location: fallback,
        wikiLink: item.country_of_origin?.wiki_url || undefined
      });
    }

    const story = item.significant_event
      ? Array.isArray(item.significant_event)
        ? (item.significant_event[0] && item.significant_event[0].name) || ''
        : item.significant_event.name || ''
      : '';

    // Use Wikipedia link first, fallback to Wikidata
    const wikiLink =
      (item.wikibase_article && item.wikibase_article.wikipedia_url) ||
      (item.wikibase_article && item.wikibase_article.wiki_url) ||
      undefined;

    const painting: Painting = {
      id,
      title,
      artist,
      imageUrl,
      rounds,
      story,
      storyImageUrl: imageUrl,
      wikiLink: wikiLink,

    };

    return painting;
  });

  return paintings;
}

/** Return a random sample (shuffled) of the generated paintings */
export function sampleMockPaintings(paintings: Painting[], sampleSize = 5): Painting[] {
  if (!Array.isArray(paintings)) return [];
  const s = shuffle(paintings).slice(0, sampleSize);
  return s;
}

export default generateMockPaintingsFromData;
