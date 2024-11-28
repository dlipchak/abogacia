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
                const scriptPath = path.resolve(__dirname, "wwwroot/js/extract-selectors.js");
                const rawOutput = execSync(`node ${scriptPath} ${url}`, { encoding: "utf-8" }).trim();

                console.log(`Raw output from extract-selectors.js for ${key}:\n${rawOutput}`);

                const selectors = safeParseJSON(rawOutput);
                console.log(`Extracted ${selectors.length} selectors for ${key}:\n${selectors.join("\n")}`);

                entries[key].selectors = selectors;
            } catch (error) {
                console.error(`Failed to extract selectors for ${key} (${url}):`, error.message);
                entries[key].selectors = []; // Fallback to an empty list
            }
        });
    }

    // Create a single PurgeCSSPlugin instance but run it for each entry with its own paths and safelists
    const generatePurgeCSSPlugin = () =>
        Object.entries(entries).map(([key, { purgePaths, selectors }]) => {
            console.log(`Creating PurgeCSSPlugin instance for ${key}`);
            return new PurgeCSSPlugin({
                paths: purgePaths, // Only the paths for the current entry
                safelist: {
                    standard: selectors.map((selector) => selector.replace(/^\./, "")), // Only the safelist for the current entry
                },
            });
        });


    return {
        mode: isDevelopment ? "development" : "production",
        devtool: isDevelopment ? "source-map" : false,
        entry: Object.fromEntries(
            Object.entries(entries).map(([key, { entry }]) => [key, entry])
        ),
        output: {
            path: path.resolve(__dirname, "wwwroot/dist"),
            filename: `[name].bundle${hash}.js`,
            clean: true,
        },
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
        plugins: [
            new MiniCssExtractPlugin({
                filename: `[name].bundle${hash}.css`,
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
            generatePurgeCSSPlugin(), // Use the single PurgeCSSPlugin
            {
                apply: (compiler) => {
                    compiler.hooks.done.tap("CustomManifestPlugin", (stats) => {
                        const manifest = {};
                        const assets = stats.toJson().assetsByChunkName;

                        Object.keys(assets).forEach((chunkName) => {
                            const files = Array.isArray(assets[chunkName])
                                ? assets[chunkName]
                                : [assets[chunkName]];
                            files.forEach((file) => {
                                const ext = file.split(".").pop();
                                manifest[`${chunkName}.${ext}`] = `${file}`;
                            });
                        });

                        const manifestPath = path.resolve(
                            __dirname,
                            "wwwroot/rev-manifest.json"
                        );
                        fs.writeFileSync(
                            manifestPath,
                            JSON.stringify(manifest, null, 2)
                        );
                    });
                },
            },
        ],
        resolve: {
            extensions: [".js", ".json", ".css"],
            alias: {
                "@css": path.resolve(__dirname, "wwwroot/css"),
                "@js": path.resolve(__dirname, "wwwroot/js"),
            },
        },
    };
};
