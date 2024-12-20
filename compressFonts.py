import os
import re
import subprocess

def extract_unicodes_from_icons(file_path):
    """
    Extract Unicode values from a file containing icon definitions.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            content = file.read()
        
        # Find all Unicode values in the file using regex
        unicode_matches = re.findall(r'content:\s*"?\\([a-fA-F0-9]+)"?', content)
        
        # Convert matches to Unicode format (U+xxxx)
        unicodes = [f"U+{code.upper()}" for code in unicode_matches]
        
        return ",".join(unicodes)
    except FileNotFoundError:
        raise Exception(f"Icons file not found: {file_path}")
    except Exception as e:
        raise Exception(f"Error processing icons file: {e}")

def subset_fonts(unicodes, fonts_dir):
    """
    Subset all .woff2 fonts in the given directory using the extracted Unicode values.
    """
    woff2_files = [
        os.path.join(root, file)
        for root, _, files in os.walk(fonts_dir)
        for file in files
        if file.endswith(".woff2")
    ]

    if not woff2_files:
        print("No .woff2 fonts found in the directory.")
        return

    for font_file in woff2_files:
        output_file = os.path.splitext(font_file)[0] + "-subset.woff2"
        pyftsubset_command = [
            "pyftsubset",
            font_file,
            f"--unicodes={unicodes}",
            f"--output-file={output_file}"
        ]

        print("Running command:", " ".join(pyftsubset_command))
        
        result = subprocess.run(pyftsubset_command, text=True)
        if result.returncode != 0:
            print(f"Error subsetting {font_file}")
        else:
            print(f"Successfully subsetted {font_file} to {output_file}")

def main():
    try:
        icons_file = "C:\\Repos\\abogacia\\used-glyphs.txt"
        print(f"Reading Unicode glyphs from file: {icons_file}")
        unicodes = extract_unicodes_from_icons(icons_file)
        print("Extracted Unicode glyphs:", unicodes)

        fonts_dir = "C:\\Repos\\abogacia\\wwwroot\\css"
        print(f"Processing .woff2 fonts in directory: {fonts_dir}")
        subset_fonts(unicodes, fonts_dir)
    except Exception as e:
        print("An error occurred:", e)

if __name__ == "__main__":
    main()
