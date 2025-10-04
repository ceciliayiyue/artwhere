import table_to_qid
from urllib.parse import urlparse
from tqdm import tqdm

"""Script to read catalogue URLs from a file, extract Q-IDs from each page, and save them to a text file."""

INPUT_FILE = "./output/Collection_catalogs.txt"
OUTPUT_FILE = "./output/painting_QIDS.txt"

def save_qids_to_file(qids, filename):
    """Save Q-IDs to a text file, one per line."""
    with open(filename, "w", encoding="utf-8") as f:
        for qid in qids:
            f.write(qid + "\n")
    print(f"Saved {len(qids)} Q-IDs to {filename}")

file = open(INPUT_FILE, 'r')
urls = [line.strip() for line in file.readlines()]
all_qids = set()

for url in tqdm(urls):
    url = url.replace("\n", "")
    qids = table_to_qid.get_QIDs_from_table(url)
    all_qids.update(qids)

save_qids_to_file(all_qids, OUTPUT_FILE)

file.close()