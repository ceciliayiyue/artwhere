import requests
import constants 

def get_coordinates(qid):
    """
    Given a Wikidata Q-ID, return the coordinate location if it exists.
    Returns (latitude, longitude) or None if not found.
    """
    url = f"https://www.wikidata.org/wiki/Special:EntityData/{qid}.json"
    response = requests.get(url, headers=constants.HEADERS)
    response.raise_for_status()
    data = response.json()

    entity = data.get("entities", {}).get(qid, {})
    claims = entity.get("claims", {})

    # Property for coordinate location in Wikidata is P625
    coord_claims = claims.get("P625", [])
    if not coord_claims:
        return None

    # Take the first coordinate claim
    coord = coord_claims[0].get("mainsnak", {}).get("datavalue", {}).get("value", {})
    lat = coord.get("latitude")
    lon = coord.get("longitude")
    if lat is not None and lon is not None:
        return (lat, lon)
    return None

# Example usage:
# qid = "Q10292830"  # Replace with any Q-ID
# coords = get_coordinates(qid)
# if coords:
#     print(f"Coordinates for {qid}: {coords[0]}, {coords[1]}")
# else:
#     print(f"No coordinate location found for {qid}")
