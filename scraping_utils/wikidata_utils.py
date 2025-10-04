import requests
import constants

BASE_URL = "https://www.wikidata.org/w/api.php"

def get_entity_label(qid, language="en"):
    params = {
        "action": "wbgetentities",
        "ids": qid,
        "format": "json",
        "props": "labels"
    }
    resp = requests.get(BASE_URL, params=params, headers=constants.HEADERS).json()
    ent = resp.get("entities", {}).get(qid, {})
    # fall back to 'mul' if the requested language doesn't exist
    return ent.get("labels", {}).get(language, {}).get("value") or \
           ent.get("labels", {}).get("mul", {}).get("value", "")