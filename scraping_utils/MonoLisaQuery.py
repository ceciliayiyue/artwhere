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
    "movement": "P135",
    "inception": "P571"  # Added inception
}

qualifier_map = {
    "P585": "point_in_time",
    "P1365": "beforehand_owned_by",
    "P1366": "afterward_owned_by",
    "P770": "cause_of_destruction"
}

date_qualifiers = {"P580": "start_time", "P582": "end_time"}

LABEL_CACHE = {}
WIKI_CACHE = {}

def get_entity_info(qid):
    if qid in LABEL_CACHE:
        return {"name": LABEL_CACHE[qid], "wikipedia_url": WIKI_CACHE.get(qid)}

    try:
        params = {
            "action": "wbgetentities",
            "ids": qid,
            "format": "json",
            "props": "labels|sitelinks",
            "languages": "en"
        }
        resp = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=10)
        resp.raise_for_status()
        ent = resp.json().get("entities", {}).get(qid, {})

        name = ent.get("labels", {}).get("en", {}).get("value")
        LABEL_CACHE[qid] = name

        sitelinks = ent.get("sitelinks", {})
        enwiki_title = sitelinks.get("enwiki", {}).get("title")
        wikipedia_url = f"https://en.wikipedia.org/wiki/{enwiki_title.replace(' ', '_')}" if enwiki_title else None
        WIKI_CACHE[qid] = wikipedia_url

        return {"name": name, "wikipedia_url": wikipedia_url}
    except Exception as e:
        print(f"Error fetching label/Wikipedia for {qid}: {e}")
        return {"name": None, "wikipedia_url": None}

def get_claims(entity_id, property_id):
    params = {"action": "wbgetclaims", "entity": entity_id, "property": property_id, "format": "json"}
    resp = requests.get(BASE_URL, params=params, headers=HEADERS)
    return resp.json().get("claims", {}).get(property_id, [])

def extract_dates(claim):
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

def get_creator_info(entity_id):
    query = f"""
    SELECT ?creator ?creatorLabel WHERE {{
        wd:{entity_id} wdt:P170 ?creator.
        SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
    }}
    """
    url = "https://query.wikidata.org/sparql"
    headers = {"User-Agent": "MyWikidataApp/1.0 (your_email@example.com)"}
    resp = requests.get(url, params={"query": query, "format": "json"}, headers=headers)
    resp.raise_for_status()
    data = resp.json()
    bindings = data.get('results', {}).get('bindings', [])
    if bindings:
        qid_url = bindings[0]['creator']['value']
        qid = qid_url.split('/')[-1]
        info = get_entity_info(qid)
        return {"name": info["name"], "wiki_url": f"https://www.wikidata.org/wiki/{qid}", "wikipedia_url": info["wikipedia_url"]}
    return {"name": None, "wiki_url": None, "wikipedia_url": None}

results = {}
info = get_entity_info(entity_id)
results["wikibase_article"] = {
    "id": entity_id,
    "title": info["name"],
    "wiki_url": f"https://www.wikidata.org/wiki/{entity_id}",
    "wikipedia_url": info["wikipedia_url"]
}

for key, prop in properties.items():
    items = []

    if key == "creator":
        items.append(get_creator_info(entity_id))
    else:
        claims = get_claims(entity_id, prop)

        for claim in claims:
            datavalue = claim.get("mainsnak", {}).get("datavalue", {}).get("value", {})

            if key == "significant_event":
                event = {}
                if isinstance(datavalue, dict) and "id" in datavalue:
                    event_info = get_entity_info(datavalue["id"])
                    event.update({
                        "id": datavalue["id"],
                        "name": event_info["name"],
                        "wiki_url": f"https://www.wikidata.org/wiki/{datavalue['id']}",
                        "wikipedia_url": event_info["wikipedia_url"]
                    })
                else:
                    event.update({"id": None, "name": datavalue, "wiki_url": None, "wikipedia_url": None})

                qualifiers = claim.get("qualifiers", {})
                for qprop, qlist in qualifiers.items():
                    for q in qlist:
                        qval = q.get("datavalue", {}).get("value")
                        if qprop == "P585":
                            if isinstance(qval, dict):
                                event["point_in_time"] = qval.get("time", "").lstrip("+").split("T")[0]
                        elif qprop == "P770":
                            if isinstance(qval, dict) and "id" in qval:
                                cd_info = get_entity_info(qval["id"])
                                event["cause_of_destruction"] = cd_info["name"]
                                event["cause_of_destruction_wikipedia_url"] = cd_info["wikipedia_url"]
                            else:
                                event["cause_of_destruction"] = qval

                items.append(event)

            elif key == "inception":
                # Inception date is usually a datetime string
                if isinstance(datavalue, dict):
                    date = datavalue.get("time", "").lstrip("+").split("T")[0]
                else:
                    date = datavalue
                items.append(date)

            elif key == "image" and isinstance(datavalue, str):
                items.append({"image": f"https://commons.wikimedia.org/wiki/Special:FilePath/{datavalue.replace(' ', '_')}"})

            elif key in ["owner", "location"]:
                entity_info = get_entity_info(datavalue["id"] if isinstance(datavalue, dict) else datavalue)
                start, end = extract_dates(claim)
                items.append({
                    "name": entity_info.get("name"),
                    "wiki_url": f"https://www.wikidata.org/wiki/{datavalue['id']}" if isinstance(datavalue, dict) else None,
                    "wikipedia_url": entity_info.get("wikipedia_url"),
                    "start_time": start,
                    "end_time": end
                })

            elif key in ["movement", "country_of_origin", "location_of_creation"]:
                entity_info = get_entity_info(datavalue["id"] if isinstance(datavalue, dict) else datavalue)
                items.append({
                    "name": entity_info.get("name"),
                    "wiki_url": f"https://www.wikidata.org/wiki/{datavalue['id']}" if isinstance(datavalue, dict) else None,
                    "wikipedia_url": entity_info.get("wikipedia_url")
                })

            else:
                items.append(datavalue)

    results[key] = collapse_list(items)

pprint.pprint(results)
