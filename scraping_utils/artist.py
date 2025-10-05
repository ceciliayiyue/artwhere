import requests
import constants 
import location
import wikidata_utils

properties = {
    "place of birth": "P19",
}

BASE_URL = "https://www.wikidata.org/w/api.php"

def get_person_information(qid):
    """
    Given a Wikidata Q-ID that concerns a PERSON, returns a JSON of specified properties.
    Returns object or None if not found.

    Return object schema:
    {
        "name": 'XXXX',
        "place_of_birth": {
            name: 'XXXXX',
            coordinates: (lat, lon)
    }
    """
    person_info = {}
    url = f"https://www.wikidata.org/wiki/Special:EntityData/{qid}.json"
    response = requests.get(url, headers=constants.HEADERS)
    response.raise_for_status()
    data = response.json()

    entity = data.get("entities", {}).get(qid, {})
    claims = entity.get("claims", {})

    name_obj = claims.get(properties["place of birth"], [])
    if not name_obj:
        return None

    person_info["name"] = wikidata_utils.get_entity_label(qid)

    # Property for place of birth
    location_obj = claims.get(properties["place of birth"], [])
    if not location_obj:
        return None

    # Take the first location claim
    loc = location_obj[0].get("mainsnak", {}).get("datavalue", {}).get("value", {})
    qid_loc = loc.get("id")
    if qid_loc: 
        get_location_info = location.get_location_info(qid_loc)
        person_info["place_of_birth"] = get_location_info

    return person_info

## Example usage:
# qid = "Q762"  # Replace with any Q-ID
# info = get_person_information(qid)
# if info:
#     print(f"Information for {qid}: {info}")
# else:
#     print(f"No information found for {qid}")