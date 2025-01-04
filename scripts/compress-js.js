const glob = require("glob");
const fs = require("fs");
const zlib = require("zlib");
const util = require("util");
const brotli = require("brotli");
const path = require("path");

// Promisify the needed functions
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const gzip = util.promisify(zlib.gzip);

async function compressFiles() {
  try {
    const jsRootDir = path.join(__dirname, "../src/js");
    const compressedDir = path.join(jsRootDir, "compressed");

    // Debug logs
    console.log("Script directory:", __dirname);
    console.log("Looking for JS files in:", jsRootDir);
    console.log("Compressed files will go to:", compressedDir);

    // Create compressed directory if it doesn't exist
    if (!fs.existsSync(compressedDir)) {
      await mkdir(compressedDir, { recursive: true });
    }

    // Check if a specific path was provided
    const targetPath = process.argv[2];
    let files = [];

    if (targetPath) {
      const absolutePath = path.resolve(targetPath);
      if (!fs.existsSync(absolutePath)) {
        console.error(`❌ Path not found: ${absolutePath}`);
        process.exit(1);
      }

      if (fs.statSync(absolutePath).isDirectory()) {
        console.log(`Processing directory: ${absolutePath}`);
        files = glob.sync("**/*.js", {
          cwd: absolutePath,
          ignore: ["**/*.br", "**/*.gz", "**/*.map"],
          absolute: true,
        });
      } else if (absolutePath.endsWith(".js")) {
        console.log(`Processing single file: ${absolutePath}`);
        files = [absolutePath];
      } else {
        console.error("❌ Target must be a .js file or a directory");
        process.exit(1);
      }
    } else {
      // Get all .js files including those in the root directory
      files = glob.sync("**/*.js", {
        cwd: jsRootDir,
        ignore: [
          "pages/**/*",
          "compressed/**/*",
          "**/*.br",
          "**/*.gz",
          "**/*.map",
        ],
        absolute: true,
      });
    }

    console.log("Found files to compress:", files.length);

    for (const file of files) {
      const content = await readFile(file);
      const relativePath = path.relative(jsRootDir, file);
      const targetDir = path.join(compressedDir, path.dirname(relativePath));
      const targetBase = path.join(targetDir, path.basename(file));

      if (content.length === 0) {
        console.log(`⚠ Skipping empty file: ${relativePath}`);
        continue;
      }

      try {
        // Create target directory if it doesn't exist
        await mkdir(targetDir, { recursive: true });

        // Maximum Brotli compression
        const brotliCompressed = Buffer.from(
          brotli.compress(content, {
            mode: 1, // 1 = text mode (best for JS/CSS/HTML)
            quality: 11, // maximum compression level
            lgwin: 24, // maximum window size
            lgblock: 24, // maximum block size
          })
        );

        // Maximum Gzip compression
        const gzipCompressed = await gzip(content, {
          level: 9, // maximum compression level
          memLevel: 9, // maximum memory for compression
          windowBits: 15, // maximum window size
        });

        // Write compressed files
        await writeFile(`${targetBase}.br`, brotliCompressed);
        await writeFile(`${targetBase}.gz`, gzipCompressed);

        // Log compression results
        const originalSize = (content.length / 1024).toFixed(2);
        const brotliSize = (brotliCompressed.length / 1024).toFixed(2);
        const gzipSize = (gzipCompressed.length / 1024).toFixed(2);
        const brotliRatio = (
          (brotliCompressed.length / content.length) *
          100
        ).toFixed(1);
        const gzipRatio = (
          (gzipCompressed.length / content.length) *
          100
        ).toFixed(1);

        console.log(`✓ ${relativePath}`);
        console.log(`  Original: ${originalSize}KB`);
        console.log(
          `  Brotli:   ${brotliSize}KB (${brotliRatio}% of original)`
        );
        console.log(`  Gzip:     ${gzipSize}KB (${gzipRatio}% of original)`);
        console.log();
      } catch (err) {
        console.error(`✗ Error compressing ${relativePath}:`, err.message);
      }
    }

    console.log("\nCompression complete! 🎉");
  } catch (error) {
    console.error("Error processing files:", error);
    process.exit(1);
  }
}

// Run the compression
compressFiles();
