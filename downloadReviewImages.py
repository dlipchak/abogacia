import json
import os
import requests

# Load JSON data from reviews.json
with open("reviews.json", "r", encoding="utf-8") as file:
    json_data = json.load(file)

# Specify the folder to save images
output_folder = "review_images"
os.makedirs(output_folder, exist_ok=True)  # Create the folder if it doesn't exist

# Loop through each entry in the JSON data
for index, entry in enumerate(json_data):
    image_url = entry.get("imageUrl", "").strip()
    reviewer_name = entry.get("reviewerName", f"reviewer_{index}").replace(" ", "_").replace("/", "_").replace("\\", "_")

    if not image_url:
        print(f"Skipping review {index}: No image URL found")
        continue

    # Construct the image filename and path
    image_filename = f"{reviewer_name}_{index}.jpg"
    image_path = os.path.join(output_folder, image_filename)

    # Download the image
    try:
        response = requests.get(image_url, stream=True, timeout=10)
        if response.status_code == 200:
            with open(image_path, "wb") as image_file:
                for chunk in response.iter_content(1024):
                    image_file.write(chunk)
            print(f"Downloaded: {image_filename}")
        else:
            print(f"Failed to download {image_url} (Status code: {response.status_code})")
    except Exception as e:
        print(f"Error downloading {image_url}: {e}")

print("Download process completed.")
