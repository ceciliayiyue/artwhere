from  wikidata_article_info_fetcher import fetch_wikidata_entity
import json 
from tqdm import tqdm

INPUT_FILE = "./output/small_famous_painting_QIDS.txt"

file = open(INPUT_FILE, 'r')
qids = [line.strip() for line in file.readlines()]
data_list = []

for qid in tqdm(qids):
    qid = qid.replace("\n", "")
    try:
        data = fetch_wikidata_entity(qid)
    except Exception as e:
        print(f"Error fetching {qid}: {e}")
        continue
    data_list.append(data)

json_obj = {"data" : data_list}
with open('dataFinal.json', 'w') as f:
    json.dump(json_obj, f)

file.close()
