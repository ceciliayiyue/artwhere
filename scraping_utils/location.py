import requests
import constants 

def get_coordinates(qid):
    """
    Given a Wikidata Q-ID that concerns a location, return the coordinate location if it exists on the page.
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

def get_title(qid, language="en"):
    """
    Given a Wikidata Q-ID, return the title/label in the specified language (default is English).
    Returns the title as a string or None if not found.
    """
    url = f"https://www.wikidata.org/wiki/Special:EntityData/{qid}.json"
    response = requests.get(url, headers=constants.HEADERS)
    response.raise_for_status()
    data = response.json()

    entity = data.get("entities", {}).get(qid, {})
    labels = entity.get("labels", {})
    label_info = labels.get(language)
    if label_info:
        return label_info.get("value")
    return None

def get_location_info(qid, language="en"):
    """
    Given a Wikidata Q-ID that concerns a location, return a dictionary with the title and coordinates.
    Returns:
    {
        "name": 'XXXXX',
        "coordinates": (lat, lon)
    }
    or None if not found.
    """
    title = get_title(qid, language)
    coordinates = get_coordinates(qid)
    if title or coordinates:
        return {
            "name": title,
            "coordinates": coordinates
        }
    return None