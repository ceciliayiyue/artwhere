import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import constants

"""Script to scrape a Wikidata catalog page and extract Q-IDs from a specific table, handling nested links."""

def fetch_page(url):
    """Fetch HTML content of a URL with proper headers."""
    try:
        response = requests.get(url, headers=constants.HEADERS)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return None

def extract_wikidata_table_qids(html):
    """Extract Q-IDs from the first table, skipping the first column."""
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table", {"class": "wikitable"})
    if not table:
        return []

    qids = []
    for row in table.find_all("tr")[1:]:
        columns = row.find_all("td")
        if len(columns) > 1:
            wikidata_cell = columns[1]  # Second column contains Q-IDs
            link = wikidata_cell.find("a", href=True)
            if link and "/wiki/Q" in link['href']:
                qid = link['href'].split("/wiki/")[1]
                qids.append(qid)
    return qids

def extract_intermediary_links(html, base_url, catalog_prefix):
    """Extract links from the page that start with the catalog prefix."""
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table", {"class": "wikitable"})
    links = []
    if table:
        for row in table.find_all("tr")[1:]:
            columns = row.find_all("td")
            for cell in columns[1:]:  # Skip first column
                a_tag = cell.find("a", href=True)
                if a_tag:
                    full_url = urljoin(base_url, a_tag['href'])
                    if full_url.startswith(catalog_prefix):
                        links.append(full_url)
    return links

def scrape_catalog_page(url, catalog_prefix, visited=None, log_file=None):
    """Recursively scrape a catalog page for all Q-IDs."""
    if visited is None:
        visited = set()
    if url in visited:
        return []

    visited.add(url)
    html = fetch_page(url)
    if not html:
        if log_file:
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(f"Failed to fetch: {url}\n")
        return []

    # Extract Q-IDs from table
    qids = extract_wikidata_table_qids(html)

    # Extract intermediary links and recurse
    sub_links = extract_intermediary_links(html, base_url="https://www.wikidata.org", catalog_prefix=catalog_prefix)
    for link in sub_links:
        qids.extend(scrape_catalog_page(link, catalog_prefix, visited, log_file))

    return qids

def get_QIDs_from_table(catalog_url):
    # Main catalog page
    catalog_prefix = "https://www.wikidata.org/wiki/Wikidata:WikiProject_sum_of_all_paintings/Catalog/"

    log_file = "scrape_failures.log"

    # Scrape recursively
    all_qids = scrape_catalog_page(catalog_url, catalog_prefix, log_file=log_file)
    return all_qids

    # Save to file named after the catalog slug
    # slug = os.path.basename(urlparse(catalog_url).path)
    # save_qids_to_file(all_qids, f"{slug}.txt")
