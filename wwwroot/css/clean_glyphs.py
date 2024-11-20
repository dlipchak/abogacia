input_file = "used-glyphs.txt"
output_file = "cleaned-glyphs.txt"

with open(input_file, "r") as f:
    lines = f.readlines()

# Filter out invalid lines (keep only those starting with "U+")
valid_lines = [line.strip() for line in lines if line.startswith("U+")]

# Write cleaned Unicode values to a new file
with open(output_file, "w") as f:
    f.write(",".join(valid_lines))

print(f"Cleaned glyphs saved to {output_file}")