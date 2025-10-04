import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import os
import constants

"""Script to scrape a catalogue page and extract URLs from a specific table."""

def fetch_page(url):
    """Fetch HTML content of a URL with proper headers."""
    response = requests.get(url, headers=constants.HEADERS)
    response.raise_for_status()
    return response.text

def extract_table_links(html, base_url="https://www.wikidata.org"):
    """Extract all links from the first wikitable, skipping the first column."""
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table", {"class": "wikitable"})
    if not table:
        print("No table found on the page.")
        return []

    links = []
    for row in table.find_all("tr")[1:]:  # Skip header
        columns = row.find_all("td")
        if not columns:
            continue
        for cell in columns[1:]:  # Skip the first column
            a_tag = cell.find("a", href=True)
            if a_tag:
                full_url = urljoin(base_url, a_tag["href"])
                links.append(full_url)
    return links

def save_links_to_file(links, filename):
    """Save a list of links to a text file, one per line."""
    with open(filename, "w", encoding="utf-8") as f:
        for link in links:
            f.write(link + "\n")
    print(f"Saved {len(links)} links to {filename}")

if __name__ == "__main__":
    url = "https://www.wikidata.org/wiki/Wikidata:WikiProject_sum_of_all_paintings/Collection_catalogs"
    html = fetch_page(url)
    links = extract_table_links(html)
    catalog_prefix = "https://www.wikidata.org/wiki/Wikidata:WikiProject_sum_of_all_paintings/Catalog/"
    catalog_links = [link for link in links if link.startswith(catalog_prefix)]
    slug = os.path.basename(urlparse(url).path)
    save_links_to_file(catalog_links, f"{slug}.txt")
