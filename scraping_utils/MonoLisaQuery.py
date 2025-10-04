import requests
import pprint

entity_id = "Q12418"  # Mona Lisa

BASE_URL = "https://www.wikidata.org/w/api.php"
HEADERS = {"User-Agent": "MyWikidataApp/1.0 (your_email@example.com)"}

properties = {
    "owner": "P127",
    "location": "P276",
    "image": "P18",
    "country_of_origin": "P495",
    "location_of_creation": "P1071",
    "significant_event": "P793",
    "creator": "P170",
    "movement": "P135"
}

qualifier_map = {
    "P585": "point_in_time",
    "P1365": "beforehand_owned_by",
    "P1366": "afterward_owned_by"
}

date_qualifiers = {"P580": "start_time", "P582": "end_time"}

def get_claims(entity_id, property_id):
    params = {"action": "wbgetclaims", "entity": entity_id, "property": property_id, "format": "json"}
    resp = requests.get(BASE_URL, params=params, headers=HEADERS)
    return resp.json().get("claims", {}).get(property_id, [])

def get_entity_label(qid):
    params = {"action": "wbgetentities", "ids": qid, "format": "json", "languages": "en", "props": "labels"}
    resp = requests.get(BASE_URL, params=params, headers=HEADERS).json()
    ent = resp.get("entities", {}).get(qid, {})
    return ent.get("labels", {}).get("en", {}).get("value")

def format_entity(datavalue):
    if isinstance(datavalue, dict) and "id" in datavalue:
        qid = datavalue["id"]
        return {"id": qid, "name": get_entity_label(qid), "wiki_url": f"https://www.wikidata.org/wiki/{qid}"}
    return datavalue

def extract_owner_dates(claim):
    """Extract start and end dates for owner claims"""
    qualifiers = claim.get("qualifiers", {})
    start_time = qualifiers.get("P580", [{}])[0].get("datavalue", {}).get("value", {}).get("time")
    end_time = qualifiers.get("P582", [{}])[0].get("datavalue", {}).get("value", {}).get("time")
    start = start_time.lstrip("+").split("T")[0] if start_time else None
    end = end_time.lstrip("+").split("T")[0] if end_time else None
    return start, end

def collapse_list(lst):
    if isinstance(lst, list) and len(lst) == 1:
        return lst[0]
    return lst

results = {}

# Main article
title = get_entity_label(entity_id)
results["wikibase_article"] = {
    "id": entity_id,
    "title": title,
    "wiki_url": f"https://www.wikidata.org/wiki/{entity_id}"
}

for key, prop in properties.items():
    claims = get_claims(entity_id, prop)
    items = []

    for claim in claims:
        datavalue = claim.get("mainsnak", {}).get("datavalue", {}).get("value", {})

        if key == "significant_event":
            event = {}
            if isinstance(datavalue, dict) and "id" in datavalue:
                event.update(format_entity(datavalue))
            else:
                event["id"] = None
                event["name"] = datavalue
                event["wiki_url"] = None

            qualifiers = claim.get("qualifiers", {})
            for qprop, qlist in qualifiers.items():
                field = qualifier_map.get(qprop)
                if not field:
                    continue
                qval = qlist[0].get("datavalue", {}).get("value")
                if field == "point_in_time" and isinstance(qval, dict):
                    event[field] = qval.get("time", "").lstrip("+").split("T")[0]
                else:
                    event[field] = format_entity(qval)
            items.append(event)

        elif key == "image" and isinstance(datavalue, str):
            img_url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{datavalue.replace(' ', '_')}"
            items.append({"image": img_url})

        elif key == "owner":
            owner_name = format_entity(datavalue)["name"] if isinstance(datavalue, dict) else datavalue
            start, end = extract_owner_dates(claim)
            items.append({"name": owner_name, "start_time": start, "end_time": end})

        else:
            items.append(format_entity(datavalue)["name"] if isinstance(datavalue, dict) else datavalue)

    results[key] = collapse_list(items)

pprint.pprint(results)
