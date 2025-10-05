const path = require('path');
const d = require(path.join(__dirname, '..', 'scraping_utils', 'data.json'));
const items = (d && d.data) || [];
function safeGetCoordinates(obj){
  if(!obj) return null;
  if(Array.isArray(obj) && obj.length>=2 && typeof obj[0]==='number') return {lat:obj[0], lng:obj[1], name:undefined};
  if(obj && obj.coordinates && Array.isArray(obj.coordinates) && obj.coordinates.length>=2) return {lat:obj.coordinates[0], lng:obj.coordinates[1], name:obj.name||undefined};
  return null;
}

items.slice(0,30).forEach((item, idx)=>{
  const title = (item.wikibase_article && item.wikibase_article.title) || `Untitled ${idx}`;
  const artist = (item.creator && item.creator.name) || 'Unknown';
  const artistBirth = safeGetCoordinates(item.creator && item.creator.place_of_birth);
  let creationLoc = null;
  if (item.location_of_creation && Object.keys(item.location_of_creation || {}).length) creationLoc = safeGetCoordinates(item.location_of_creation);
  if (!creationLoc) creationLoc = safeGetCoordinates(item.country_of_origin);
  let provenanceLoc = null;
  if (Array.isArray(item.owner)){
    for(const o of item.owner){ const c = safeGetCoordinates(o); if(c){ provenanceLoc = c; break; } }
  } else if(item.owner) provenanceLoc = safeGetCoordinates(item.owner);
  if(!provenanceLoc && item.location){
    if(Array.isArray(item.location)){
      for(const loc of item.location){ const c = safeGetCoordinates(loc); if(c){ provenanceLoc = c; break; } }
    } else provenanceLoc = safeGetCoordinates(item.location);
  }
  let currentLoc = null;
  if(Array.isArray(item.location)){
    for(const loc of item.location){ const c = safeGetCoordinates(loc); if(c){ currentLoc = c; break; } }
  } else if(item.location) currentLoc = safeGetCoordinates(item.location);
  if(!currentLoc && Array.isArray(item.owner) && item.owner.length) currentLoc = safeGetCoordinates(item.owner[0]);
  const rounds = [];
  if(artistBirth) rounds.push({desc:'Artist birthplace', loc:artistBirth});
  if(creationLoc) rounds.push({desc:'Location of creation', loc:creationLoc});
  if(provenanceLoc) rounds.push({desc:'Provenance', loc:provenanceLoc});
  if(currentLoc) rounds.push({desc:'Currently located at', loc:currentLoc});
  console.log(`#${idx} ${title} — ${artist}`);
  if(rounds.length===0) console.log('  [no rounds]');
  else rounds.forEach((r,i)=> console.log(`  ${i+1}. ${r.desc}${r.loc.name?(' - '+r.loc.name):''} (${r.loc.lat??'NA'}, ${r.loc.lng??'NA'})`));
});
console.log('Done');
