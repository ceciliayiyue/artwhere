const fs = require('fs');
const path = require('path');

// Paths
const dataPath = path.resolve(__dirname, '..', '..', 'scraping_utils', 'data.json');
const outPath = path.resolve(__dirname, 'mock_paintings_sample.json');

function safeGetCoordinates(obj) {
  if (!obj) return null;
  if (Array.isArray(obj) && obj.length >= 2 && typeof obj[0] === 'number') {
    return { lat: obj[0], lng: obj[1], name: null };
  }
  if (obj && obj.coordinates && Array.isArray(obj.coordinates) && obj.coordinates.length >= 2) {
    return { lat: obj.coordinates[0], lng: obj.coordinates[1], name: obj.name || null };
  }
  return null;
}

function pickImage(item) {
  if (!item) return null;
  if (item.image && typeof item.image === 'object' && item.image.image) return item.image.image;
  if (Array.isArray(item.image) && item.image.length && item.image[0].image) return item.image[0].image;
  return null;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

try {
  const raw = fs.readFileSync(dataPath, 'utf8');
  const parsed = JSON.parse(raw);
  const items = parsed.data || [];

  if (!items.length) {
    console.error('No items found in data.json');
    process.exit(1);
  }

  const sample = shuffle(items.slice()).slice(0, 5);

  const mockPaintings = sample.map((item, idx) => {
    const id = (item.wikibase_article && item.wikibase_article.id) || `SAMPLE_${idx}`;
    const title = (item.wikibase_article && item.wikibase_article.title) || `Untitled ${idx}`;
    const artist = (item.creator && item.creator.name) || 'Unknown Artist';
    const imageUrl = pickImage(item) || null;

    // Round 1: Artist birthplace (origin city)
    const artistBirth = safeGetCoordinates(item.creator && item.creator.place_of_birth);

    // Round 2: Location of creation (inception) -> location_of_creation or fallback to country_of_origin
    let creationLoc = null;
    if (item.location_of_creation && Object.keys(item.location_of_creation).length) {
      creationLoc = safeGetCoordinates(item.location_of_creation);
    }
    if (!creationLoc) {
      creationLoc = safeGetCoordinates(item.country_of_origin);
    }

    // Round 3: Provenance - try owner coordinates (if array, pick first with coords) or item.location
    let provenanceLoc = null;
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

    // Round 4: Currently located at (prefer item.location or owner[0])
    let currentLoc = null;
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

    const rounds = [];
    if (artistBirth) rounds.push({ description: 'Artist birthplace', location: artistBirth });
    if (creationLoc) rounds.push({ description: 'Location of creation', location: creationLoc });
    if (provenanceLoc) rounds.push({ description: 'Provenance (owner/location)', location: provenanceLoc });
    if (currentLoc) rounds.push({ description: 'Currently located at', location: currentLoc });

    if (!rounds.length) {
      const fallback = safeGetCoordinates(item.country_of_origin) || { lat: 0, lng: 0, name: 'Unknown' };
      rounds.push({ description: 'Location (fallback)', location: fallback });
    }

    const story = item.significant_event ? (Array.isArray(item.significant_event) ? (item.significant_event[0] && item.significant_event[0].name) : item.significant_event.name) : '';

    return {
      id,
      title,
      artist,
      imageUrl,
      rounds,
      story,
      storyImageUrl: imageUrl,
    };
  });

  fs.writeFileSync(outPath, JSON.stringify(mockPaintings, null, 2), 'utf8');
  console.log('Wrote', outPath);
} catch (err) {
  console.error(err);
  process.exit(1);
}
