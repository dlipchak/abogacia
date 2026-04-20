import json
import os
import re
import unicodedata
import requests

def slug_part(value):
    value = unicodedata.normalize("NFD", value)
    value = "".join(ch for ch in value if unicodedata.category(ch) != "Mn")
    value = re.sub(r"[^\w\s-]", "", value, flags=re.UNICODE)
    value = value.strip()
    value = re.sub(r"\s+", "_", value)
    return value

def build_image_filename(full_name, index):
    parts = (full_name or "").strip().split()
    if not parts:
        return f"reviewer_{index}.jpg"

    first_name = slug_part(parts[0])
    last_name = slug_part(parts[-1]) if len(parts) > 1 else "User"

    return f"{first_name}_{last_name}.jpg"

with open("reviews.json", "r", encoding="utf-8") as file:
    json_data = json.load(file)

output_folder = "review_images"
os.makedirs(output_folder, exist_ok=True)

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0"
})

for index, entry in enumerate(json_data):
    image_url = entry.get("profileImageSourceUrl", "").strip()
    reviewer_name = entry.get("reviewerName", f"reviewer_{index}")

    if not image_url:
        print(f"Skipping review {index}: No image URL found")
        continue

    image_filename = build_image_filename(reviewer_name, index)
    image_path = os.path.join(output_folder, image_filename)

    try:
        response = session.get(image_url, stream=True, timeout=15)
        response.raise_for_status()

        with open(image_path, "wb") as image_file:
            for chunk in response.iter_content(1024):
                if chunk:
                    image_file.write(chunk)

        print(f"Downloaded: {image_filename}")

    except Exception as e:
        print(f"Error downloading {image_url}: {e}")

print("Download process completed.")