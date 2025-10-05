import json

input_file = "data.json"
output_file = "data_filtered.json"

# Load JSON
with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

def has_image(entry):
    img = entry.get("image")
    if not img:
        return False
    if isinstance(img, dict):
        return bool(img.get("image"))
    if isinstance(img, list):
        # Keep entry if any item in the list has an 'image' field with content
        return any(isinstance(i, dict) and i.get("image") for i in img)
    return False

# Filter entries
filtered_data = {
    "data": [entry for entry in data.get("data", []) if has_image(entry)]
}

# Save filtered JSON
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(filtered_data, f, ensure_ascii=False, indent=2)

print(f"Kept {len(filtered_data['data'])} entries out of {len(data.get('data', []))}.")
