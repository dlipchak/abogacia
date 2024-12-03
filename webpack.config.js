const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");
const glob = require("glob-all");
const fs = require("fs");
const { execSync } = require("child_process");

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === "development";
  const hash = isDevelopment ? "" : ".[contenthash:8]";

  const entries = {
    calculatorWorkDismissal: {
      entry: "./wwwroot/js/pages/calculatorWorkDismissal/index.js",
      url: "http://localhost:5000/calculadoras/despidos",
      purgePaths: glob.sync([
        "./views/Calculators/calculatorWorkDismissal.cshtml",
        "./views/Calculators/partials/**/*.cshtml",
        "./views/shared/_Layout.cshtml",
        "./views/shared/_HeroSection.cshtml",
        "./views/shared/Footer.cshtml",
        "./views/shared/Header.cshtml",
        "./views/shared/GoogleReviewsPartial.cshtml",
        "./wwwroot/js/modules/lazyload.js",
      ]),
      selectors: [],
    },
    calculatorWorkAccident: {
      entry: "./wwwroot/js/pages/calculatorWorkAccident/index.js",
      url: "http://localhost:5000/calculadoras/accidentes-laborales",
      purgePaths: glob.sync([
        "./views/Calculators/calculatorWorkAccident.cshtml",
        "./views/Calculators/partials/**/*.cshtml",
        "./views/shared/_Layout.cshtml",
        "./views/shared/_HeroSection.cshtml",
        "./views/shared/Footer.cshtml",
        "./views/shared/Header.cshtml",
        "./views/shared/GoogleReviewsPartial.cshtml",
        "./wwwroot/js/modules/lazyload.js",
      ]),
      selectors: [],
    },
  };

  // Function to safely parse JSON
  const safeParseJSON = (jsonString) => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Error parsing JSON:", error.message);
      return []; // Fallback to empty array
    }
  };

  // Extract dynamic selectors for each entry in production mode
  if (!isDevelopment) {
    Object.keys(entries).forEach((key) => {
      const { url } = entries[key];
      try {
        const scriptPath = path.resolve(
          __dirname,
          "wwwroot/js/extract-selectors.js"
        );
        const rawOutput = execSync(`node ${scriptPath} ${url}`, {
          encoding: "utf-8",
        }).trim();

        console.log(
          `Raw output from extract-selectors.js for ${key}:\n${rawOutput}`
        );

        const selectors = safeParseJSON(rawOutput);
        console.log(
          `Extracted ${
            selectors.length
          } selectors for ${key}:\n${selectors.join("\n")}`
        );

        entries[key].selectors = selectors;
      } catch (error) {
        console.error(
          `Failed to extract selectors for ${key} (${url}):`,
          error.message
        );
        entries[key].selectors = []; // Fallback to an empty list
      }
    });
  }

  // Create Webpack configurations for each entry
  const createEntryConfig = (entryName, { entry, purgePaths, selectors }) => {
    const plugins = [
      new MiniCssExtractPlugin({
        filename: `[name]${hash}.css`,
      }),
      new CompressionPlugin({
        filename: "[path][base].gz",
        algorithm: "gzip",
        test: /\.(js|css|html|svg|json|woff|woff2)$/u,
        threshold: 0,
        minRatio: 0.8,
        exclude: /\.(map)$/u,
      }),
      new CompressionPlugin({
        filename: "[path][base].br",
        algorithm: "brotliCompress",
        test: /\.(js|css|html|svg|json|woff|woff2)$/u,
        compressionOptions: { level: 11 },
        threshold: 0,
        minRatio: 0.8,
        exclude: /\.(map)$/u,
      }),
      {
        apply: (compiler) => {
          compiler.hooks.done.tap("CustomManifestPlugin", (stats) => {
            const manifestPath = path.resolve(
              __dirname,
              "wwwroot/rev-manifest.json"
            );
            let existingManifest = {};

            // Read existing manifest if it exists
            if (fs.existsSync(manifestPath)) {
              try {
                existingManifest = JSON.parse(
                  fs.readFileSync(manifestPath, "utf-8")
                );
              } catch (error) {
                console.error("Failed to parse existing manifest:", error);
              }
            }

            // Collect assets from the current build
            const newManifest = {};
            const assets = stats.toJson().assetsByChunkName;

            Object.keys(assets).forEach((chunkName) => {
              const files = Array.isArray(assets[chunkName])
                ? assets[chunkName]
                : [assets[chunkName]];
              files.forEach((file) => {
                const ext = file.split(".").pop();
                newManifest[`${chunkName}.${ext}`] = `${file}`;
              });
            });

            // Merge new entries with the existing manifest
            const updatedManifest = { ...existingManifest, ...newManifest };

            // Write the updated manifest back to the file
            fs.writeFileSync(
              manifestPath,
              JSON.stringify(updatedManifest, null, 2)
            );
          });
        },
      },
    ];

    // Add PurgeCSSPlugin only in production mode
    if (!isDevelopment) {
      plugins.push(
        new PurgeCSSPlugin({
          paths: purgePaths,
          safelist: {
            standard: selectors.map((selector) => selector.replace(/^\./, "")),
          },
        })
      );
    }

    return {
      entry: {
        [entryName]: entry,
      },
      output: {
        path: path.resolve(__dirname, "wwwroot/dist"),
        filename: `[name]${hash}.js`,
        clean: false,
      },
      mode: isDevelopment ? "development" : "production",
      devtool: isDevelopment ? "source-map" : false,
      module: {
        rules: [
          {
            test: /\.js$/u,
            use: "babel-loader",
            exclude: /node_modules/,
          },
          {
            test: /\.(css|sass|scss)$/u,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: "css-loader",
                options: {
                  url: false,
                  sourceMap: isDevelopment,
                },
              },
            ],
          },
        ],
      },
      optimization: {
        minimize: !isDevelopment,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                unused: true,
                drop_console: !isDevelopment,
              },
            },
          }),
          new CssMinimizerPlugin(),
        ],
      },
      plugins,
      resolve: {
        extensions: [".js", ".json", ".css"],
        alias: {
          "@css": path.resolve(__dirname, "wwwroot/css"),
          "@js": path.resolve(__dirname, "wwwroot/js"),
        },
      },
    };
  };

  // Generate configurations for all entries
  const configs = Object.entries(entries).map(([entryName, entryConfig]) =>
    createEntryConfig(entryName, entryConfig)
  );

  return configs;
};
