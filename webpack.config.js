const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");
const glob = require("glob-all");
const fs = require("fs");
const { execSync } = require("child_process");
const { rmSync } = require("fs");

const commonPurgePaths = [
  "./views/shared/_Layout.cshtml",
  "./views/shared/Header.cshtml",
  "./views/shared/Footer.cshtml",
  "./views/shared/GoogleReviewsPartial.cshtml",
  "./views/shared/_HeroSection.cshtml",
  "./wwwroot/js/modules/lazyload.js",
  "./wwwroot/js/plugins.bootstrap.js",
  "./wwwroot/js/modules/stickfooteronsmall.js",
  "./wwwroot/js/modules/gototop.js",
  "./wwwroot/js/modules/logo.js",
  "./wwwroot/js/modules/bscomponents.js",
  "./wwwroot/js/modules/headers.js",
  "./wwwroot/js/modules/menus.js",
  "./wwwroot/js/modules/sliderdimensions.js",
  "./wwwroot/js/modules/bootstrap.js",
  "./wwwroot/js/modules/pagetransition.js",
];

function cleanDistFolder() {
  const distPath = path.resolve(__dirname, "wwwroot/dist");
  if (fs.existsSync(distPath)) {
    console.log("🧹 Cleaning dist folder:", distPath);
    rmSync(distPath, { recursive: true, force: true });
    console.log("✅ Cleaned wwwroot/dist folder");
  }
}

function generateUrlMapping(entries) {
  const mapping = {};
  Object.entries(entries).forEach(([key, entry]) => {
    const { url, additionalUrls } = entry;
    const parsedUrl = new URL(url);
    mapping[parsedUrl.pathname] = key;

    // Add additional URLs if they exist
    if (additionalUrls) {
      additionalUrls.forEach((additionalUrl) => {
        mapping[additionalUrl] = key;
      });
    }
  });

  const criticalDir = path.resolve(__dirname, "wwwroot/dist/critical");
  if (!fs.existsSync(criticalDir)) {
    fs.mkdirSync(criticalDir, { recursive: true });
  }

  const mappingPath = path.resolve(criticalDir, "url-mapping.json");
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log("Generated URL mapping");
}

async function generateCriticalCSS(url, entryName, entries) {
  console.log(`\n🎯 Generating Critical CSS for ${entryName}`);
  console.log(`   🌐 URL: ${url}`);

  // Read the manifest
  const manifestPath = path.resolve(__dirname, "wwwroot/rev-manifest.json");
  console.log("   📖 Reading manifest file");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

  // Get the hashed filename from manifest
  const hashedCssFileName = manifest[`${entryName}.css`];
  if (!hashedCssFileName) {
    throw new Error(`No CSS file found in manifest for ${entryName}`);
  }

  console.log(`Looking for CSS file: ${hashedCssFileName}`); // Debug log

  const cssFile = path.resolve(__dirname, `wwwroot/dist/${hashedCssFileName}`);
  const criticalDir = path.resolve(__dirname, "wwwroot/dist/critical");

  if (!fs.existsSync(criticalDir)) {
    fs.mkdirSync(criticalDir, { recursive: true });
  }

  // Wait for the hashed CSS file to exist
  let retries = 0;
  while (retries < 30) {
    if (fs.existsSync(cssFile)) {
      const stats = fs.statSync(cssFile);
      if (stats.size > 0) {
        break;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    retries++;
    console.log(`Waiting for ${hashedCssFileName} (attempt ${retries})`); // Debug log
  }

  if (!fs.existsSync(cssFile)) {
    throw new Error(`CSS file not found after ${retries} seconds: ${cssFile}`);
  }

  const viewports = [
    { width: 375, height: 640, name: "mobile" },
    { width: 768, height: 800, name: "tablet" },
    { width: 1366, height: 768, name: "desktop" },
  ];

  try {
    const { generate } = await import("critical");
    const entryConfig = entries[entryName];

    // Generate critical CSS
    await Promise.all(
      viewports.map(async (viewport) => {
        const viewportCriticalPath = path.join(
          criticalDir,
          `${entryName}.${viewport.name}.css`
        );

        await generate({
          base: "wwwroot/dist/",
          src: url,
          css: [hashedCssFileName],
          target: viewportCriticalPath,
          inline: false,
          extract: true,
          width: viewport.width,
          height: viewport.height,
          penthouse: {
            timeout: 120000,
            fontFace: false,
          },
        });

        console.log(`Generated ${viewport.name} critical CSS for ${entryName}`);
      })
    );

    // Regex-based removal of all @font-face rules from the final critical CSS
    for (const viewport of viewports) {
      const viewportCriticalPath = path.join(
        criticalDir,
        `${entryName}.${viewport.name}.css`
      );
      let criticalCSS = fs.readFileSync(viewportCriticalPath, "utf8");

      // Remove @font-face blocks
      // criticalCSS = criticalCSS.replace(/@font-face\s*{[^}]+}/g, "");

      fs.writeFileSync(viewportCriticalPath, criticalCSS);
      console.log(
        `✅ Fonts removed from ${viewport.name} critical CSS via regex`
      );
    }
  } catch (error) {
    console.error(`Failed to generate critical CSS for ${entryName}:`, error);
    throw error;
  }

  console.log(`   ✅ Completed critical CSS generation for ${entryName}`);
}

const safeParseJSON = (jsonString) => {
  console.log("🔄 Attempting to parse JSON");
  try {
    const result = JSON.parse(jsonString);
    console.log("✅ JSON parsed successfully");
    return result;
  } catch (error) {
    console.error("❌ Error parsing JSON:", error.message);
    return { selectors: [], critical: {} };
  }
};

module.exports = (env, argv) => {
  console.log("🚀 Starting webpack build process");
  console.log("Mode:", argv.mode);

  cleanDistFolder();

  const isDevelopment = argv.mode === "development";
  const hash = isDevelopment ? "" : ".[contenthash:8]";

  const entries = {
    // calculatorWorkDismissal: {
    //   entry: "./wwwroot/js/pages/calculatorWorkDismissal/index.js",
    //   url: "http://localhost:5000/calculadoras/despidos",
    //   purgePaths: glob.sync([
    //     "./views/Calculators/calculatorWorkDismissal.cshtml",
    //     "./views/Calculators/partials/**/*.cshtml",
    //     "./views/Shared/CalculatorsLinks.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // calculatorWorkAccident: {
    //   entry: "./wwwroot/js/pages/calculatorWorkAccident/index.js",
    //   url: "http://localhost:5000/calculadoras/accidentes-laborales",
    //   purgePaths: glob.sync([
    //     "./views/Calculators/calculatorWorkAccident.cshtml",
    //     "./views/Calculators/partials/**/*.cshtml",
    //     "./views/Shared/CalculatorsLinks.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // calculatorTrafficAccident: {
    //   entry: "./wwwroot/js/pages/calculatorTrafficAccident/index.js",
    //   url: "http://localhost:5000/calculadoras/accidentes-de-transito",
    //   purgePaths: glob.sync([
    //     "./views/Calculators/CalculatorTrafficAccident.cshtml",
    //     "./views/Calculators/partials/**/*.cshtml",
    //     "./views/Shared/CalculatorsLinks.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // faqDismissal: {
    //   entry: "./wwwroot/js/pages/faqDismissal/index.js",
    //   url: "http://localhost:5000/preguntas-frecuentes/despidos",
    //   purgePaths: glob.sync([
    //     "./views/FAQ/DismissalsFaq.cshtml",
    //     "./views/Shared/CalculatorsLinks.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // faqTrafficAccident: {
    //   entry: "./wwwroot/js/pages/faqTrafficAccident/index.js",
    //   url: "http://localhost:5000/preguntas-frecuentes/accidentes-de-transito",
    //   purgePaths: glob.sync([
    //     "./views/FAQ/TrafficAccidentFaq.cshtml",
    //     "./views/Shared/CalculatorsLinks.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // faqWorkAccident: {
    //   entry: "./wwwroot/js/pages/faqWorkAccident/index.js",
    //   url: "http://localhost:5000/preguntas-frecuentes/accidentes-laborales",
    //   purgePaths: glob.sync([
    //     "./views/FAQ/WorkAccidentFaq.cshtml",
    //     "./views/Shared/CalculatorsLinks.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    contactUs: {
      entry: "./wwwroot/js/pages/contactUs/index.js",
      url: "http://localhost:5000/contacto",
      purgePaths: glob.sync([
        "./views/ContactUs/ContactUs.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
      additionalUrls: ["/Contacto", "/contacto"],
    },
    // workerRights: {
    //   entry: "./wwwroot/js/pages/workerRights/index.js",
    //   url: "http://localhost:5000/despidos/derechos-del-trabajador",
    //   purgePaths: glob.sync([
    //     "./views/Dismissals/WorkerRights.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // articles: {
    //   entry: "./wwwroot/js/pages/articles/index.js",
    //   url: "http://localhost:5000/guias",
    //   purgePaths: glob.sync([
    //     "./views/Articles/Articles.cshtml",
    //     "./views/Articles/ArticlesHeader.cshtml",
    //     "./views/Shared/CalculatorsLinks.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // accidentesEnTransportePublico: {
    //   entry: "./wwwroot/js/pages/articles/index.js",
    //   url: "http://localhost:5000/guias/accidentes-en-transporte-publico",
    //   purgePaths: glob.sync([
    //     "./views/Articles/AccidentesEnTransportePublico.cshtml",
    //     "./views/Articles/ArticlesHeader.cshtml",
    //     "./views/Shared/CalculatorsLinks.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // accidentesEnAuto: {
    //   entry: "./wwwroot/js/pages/articles/index.js",
    //   url: "http://localhost:5000/guias/accidentes-en-auto",
    //   purgePaths: glob.sync([
    //     "./views/Articles/AccidentesEnAuto.cshtml",
    //     "./views/Articles/ArticlesHeader.cshtml",
    //     "./views/Shared/CalculatorsLinks.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // accidentesEnMoto: {
    //   entry: "./wwwroot/js/pages/articles/index.js",
    //   url: "http://localhost:5000/guias/accidentes-en-moto",
    //   purgePaths: glob.sync([
    //     "./views/Articles/AccidentesEnMoto.cshtml",
    //     "./views/Articles/ArticlesHeader.cshtml",
    //     "./views/Shared/CalculatorsLinks.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // accidentesEnBicicleta: {
    //   entry: "./wwwroot/js/pages/articles/index.js",
    //   url: "http://localhost:5000/guias/accidentes-en-bicicleta",
    //   purgePaths: glob.sync([
    //     "./views/Articles/AccidentesEnBicicleta.cshtml",
    //     "./views/Articles/ArticlesHeader.cshtml",
    //     "./views/Shared/CalculatorsLinks.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // accidentesComoAcompanantes: {
    //   entry: "./wwwroot/js/pages/articles/index.js",
    //   url: "http://localhost:5000/guias/accidentes-como-acompanantes",
    //   purgePaths: glob.sync([
    //     "./views/Articles/AccidentesComoAcompanantes.cshtml",
    //     "./views/Articles/ArticlesHeader.cshtml",
    //     "./views/Shared/CalculatorsLinks.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // accidentesComoPeaton: {
    //   entry: "./wwwroot/js/pages/articles/index.js",
    //   url: "http://localhost:5000/guias/accidentes-como-peaton",
    //   purgePaths: glob.sync([
    //     "./views/Articles/AccidentesComoPeaton.cshtml",
    //     "./views/Articles/ArticlesHeader.cshtml",
    //     "./views/Shared/CalculatorsLinks.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // destruccionTotal: {
    //   entry: "./wwwroot/js/pages/articles/index.js",
    //   url: "http://localhost:5000/guias/destruccion-total",
    //   purgePaths: glob.sync([
    //     "./views/Articles/DestruccionTotal.cshtml",
    //     "./views/Articles/ArticlesHeader.cshtml",
    //     "./views/Shared/CalculatorsLinks.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // accidentesDeTrabajo: {
    //   entry: "./wwwroot/js/pages/articles/index.js",
    //   url: "http://localhost:5000/guias/accidentes-de-trabajo",
    //   purgePaths: glob.sync([
    //     "./views/Articles/AccidentesDeTrabajo.cshtml",
    //     "./views/Articles/ArticlesHeader.cshtml",
    //     "./views/Shared/CalculatorsLinks.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // accidentesInItinere: {
    //   entry: "./wwwroot/js/pages/articles/index.js",
    //   url: "http://localhost:5000/guias/accidentes-in-itinere",
    //   purgePaths: glob.sync([
    //     "./views/Articles/AccidentesInItinere.cshtml",
    //     "./views/Articles/ArticlesHeader.cshtml",
    //     "./views/Shared/CalculatorsLinks.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // enfermedadesProfesionales: {
    //   entry: "./wwwroot/js/pages/articles/index.js",
    //   url: "http://localhost:5000/guias/enfermedades-profesionales",
    //   purgePaths: glob.sync([
    //     "./views/Articles/EnfermedadesProfesionales.cshtml",
    //     "./views/Articles/ArticlesHeader.cshtml",
    //     "./views/Shared/CalculatorsLinks.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // comoActuarAnteUnAccidenteDeTransito: {
    //   entry: "./wwwroot/js/pages/articles/index.js",
    //   url:
    //     "http://localhost:5000/guias/como-actuar-ante-un-accidente-de-transito",
    //   purgePaths: glob.sync([
    //     "./views/Articles/HowToActOnTrafficAccident.cshtml",
    //     "./views/Articles/ArticlesHeader.cshtml",
    //     "./views/Shared/CalculatorsLinks.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // covid19: {
    //   entry: "./wwwroot/js/pages/articles/index.js",
    //   url: "http://localhost:5000/guias/covid19",
    //   purgePaths: glob.sync([
    //     "./views/Articles/Covid19.cshtml",
    //     "./views/Articles/ArticlesHeader.cshtml",
    //     "./views/Shared/CalculatorsLinks.cshtml",
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    blog: {
      entry: "./wwwroot/js/pages/blog/index.js",
      url: "http://localhost:5000/novedades",
      purgePaths: glob.sync([
        "./views/Blog.cshtml",
        "./views/Shared/_Layout.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
      criticalOptions: {
        rejectUnauthorized: false,
      },
    },
    blogEntryCategory: {
      entry: "./wwwroot/js/pages/blog/index.js",
      url: "http://localhost:5000/novedades/accidentes-de-trabajo/",
      purgePaths: glob.sync([
        "./views/BlogEntryCategory.cshtml",
        "./views/Shared/_Layout.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
      criticalOptions: {
        rejectUnauthorized: false,
      },
    },
    blogEntry: {
      entry: "./wwwroot/js/pages/blog/entry.js",
      url:
        "http://localhost:5000/novedades/accidentes-de-trabajo/fractura-de-calcáneo-cuanto-paga-la-art/",
      purgePaths: glob.sync([
        "./views/BlogEntry.cshtml",
        "./views/Shared/_Layout.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
      criticalOptions: {
        rejectUnauthorized: false,
      },
    },
    home: {
      entry: "./wwwroot/js/pages/home/index.js",
      url: "http://localhost:5000/",
      purgePaths: glob.sync([
        "./views/Home/home.cshtml",
        "./views/Home/galleryPartial.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        "./wwwroot/css/reviews.css",
        "./wwwroot/css/swiper.css",
        "./wwwroot/js/plugins.swiper.js",
        "./wwwroot/js/modules/canvasslider.js",
        "./wwwroot/js/modules/sliderparallax.js",
        "./wwwroot/js/modules/animations.js",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
  };
  if (!isDevelopment) {
    console.log("📝 Production build: Extracting selectors for each entry");
    Object.keys(entries).forEach((key) => {
      const { url } = entries[key];
      console.log(`\n📝 Processing selectors for ${key}`);
      try {
        const scriptPath = path.resolve(
          __dirname,
          "wwwroot/js/extract-selectors.js"
        );
        console.log(`   🔍 Extracting from URL: ${url}`);
        const rawOutput = execSync(`node ${scriptPath} ${url}`, {
          encoding: "utf-8",
        }).trim();

        const result = safeParseJSON(rawOutput);
        console.log(
          `   ✅ Extracted ${result.selectors?.length || 0} selectors`
        );

        entries[key].selectors = result.selectors || [];
        entries[key].criticalVariables = result.critical || {};
      } catch (error) {
        console.error(
          `   ❌ Failed to extract data for ${key}:`,
          error.message
        );
        entries[key].selectors = [];
        entries[key].criticalVariables = {};
      }
    });
  }

  console.log("\n3️⃣ Generating URL mapping...");
  generateUrlMapping(entries);

  const createEntryConfig = (entryName, { entry, purgePaths, selectors }) => {
    console.log(`\n📦 Creating config for entry: ${entryName}`);
    console.log(`📄 Entry file: ${entry}`);
    console.log(`🗂️ Purge paths count: ${purgePaths.length}`);
    console.log(`🎯 Selectors count: ${selectors.length}`);

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
          compiler.hooks.done.tap("CustomManifestPlugin", async (stats) => {
            console.log("📝 Generating manifest file");
            const manifestPath = path.resolve(
              __dirname,
              "wwwroot/rev-manifest.json"
            );
            let existingManifest = {};

            if (fs.existsSync(manifestPath)) {
              console.log("📄 Reading existing manifest");
              try {
                existingManifest = JSON.parse(
                  fs.readFileSync(manifestPath, "utf-8")
                );
                console.log("✅ Existing manifest loaded");
              } catch (error) {
                console.error("❌ Failed to parse existing manifest:", error);
              }
            }

            const newManifest = {};
            const assets = stats.toJson().assetsByChunkName;

            Object.keys(assets).forEach((chunkName) => {
              console.log(`������ Processing chunk: ${chunkName}`);
              const files = Array.isArray(assets[chunkName])
                ? assets[chunkName]
                : [assets[chunkName]];
              files.forEach((file) => {
                const ext = file.split(".").pop();
                newManifest[`${chunkName}.${ext}`] = `${file}`;
              });
            });

            const updatedManifest = { ...existingManifest, ...newManifest };

            fs.writeFileSync(
              manifestPath,
              JSON.stringify(updatedManifest, null, 2)
            );
            console.log("✅ Manifest file updated");

            if (!isDevelopment) {
              console.log(
                `   🎯 Preparing to generate critical CSS for ${entryName}`
              );
              await new Promise((resolve) => setTimeout(resolve, 5000));

              const hashedCssFileName = updatedManifest[`${entryName}.css`];
              const cssFile = path.resolve(
                __dirname,
                `wwwroot/dist/${hashedCssFileName}`
              );

              if (fs.existsSync(cssFile)) {
                console.log(`   ✅ CSS file found: ${hashedCssFileName}`);
                const entryUrl = entries[entryName].url;
                await generateCriticalCSS(entryUrl, entryName, entries);
              } else {
                console.error(`   ��� CSS file not found: ${cssFile}`);
                throw new Error(`CSS file not found: ${cssFile}`);
              }
            }

            console.log(`\n✨ Finished building ${entryName}\n`);
            console.log("----------------------------------------");
          });
        },
      },
      {
        apply: (compiler) => {
          compiler.hooks.done.tap("CopyCompressedFiles", () => {
            console.log("\n📂 Starting compressed files copy process...");
            const sourceDir = path.resolve(__dirname, "wwwroot/js/compressed");
            const targetDir = path.resolve(__dirname, "wwwroot/dist");

            console.log("   📁 Source directory:", sourceDir);
            console.log("   📁 Target directory:", targetDir);

            const copyRecursively = (src, dest) => {
              if (fs.statSync(src).isDirectory()) {
                if (!fs.existsSync(dest)) {
                  fs.mkdirSync(dest, { recursive: true });
                }
                const entries = fs.readdirSync(src);
                entries.forEach((entry) => {
                  const srcPath = path.join(src, entry);
                  const destPath = path.join(dest, entry);
                  copyRecursively(srcPath, destPath);
                });
              } else {
                console.log(`   🔄 Copying: ${path.relative(sourceDir, src)}`);
                try {
                  fs.copyFileSync(src, dest);
                  console.log(
                    `   ✅ Successfully copied to: ${path.relative(
                      targetDir,
                      dest
                    )}`
                  );
                } catch (error) {
                  console.error(`   ❌ Error copying file:`, error);
                }
              }
            };

            if (fs.existsSync(sourceDir)) {
              try {
                copyRecursively(sourceDir, targetDir);
                console.log("✅ Copy process completed");
              } catch (error) {
                console.error("❌ Error during copy process:");
                console.error("   Message:", error.message);
                console.error("   Stack:", error.stack);
              }
            } else {
              console.log(`❌ Source directory does not exist: ${sourceDir}`);
            }
          });
        },
      },
      {
        apply: (compiler) => {
          compiler.hooks.done.tap("CopyFontFiles", () => {
            console.log("\n📂 Starting font files copy process...");
            const fontSourceDir = path.resolve(__dirname, "wwwroot/css/icons");
            const fontTargetDir = path.resolve(__dirname, "wwwroot/dist");

            console.log("   📁 Font source directory:", fontSourceDir);
            console.log("   📁 Font target directory:", fontTargetDir);

            const copyRecursively = (src, dest) => {
              if (fs.statSync(src).isDirectory()) {
                if (!fs.existsSync(dest)) {
                  fs.mkdirSync(dest, { recursive: true });
                }
                const entries = fs.readdirSync(src);
                entries.forEach((entry) => {
                  const srcPath = path.join(src, entry);
                  const destPath = path.join(dest, entry);
                  copyRecursively(srcPath, destPath);
                });
              } else {
                console.log(
                  `   🔄 Copying: ${path.relative(fontSourceDir, src)}`
                );
                try {
                  fs.copyFileSync(src, dest);
                  console.log(
                    `   ✅ Successfully copied to: ${path.relative(
                      fontTargetDir,
                      dest
                    )}`
                  );
                } catch (error) {
                  console.error(`   ❌ Error copying file:`, error);
                }
              }
            };

            if (fs.existsSync(fontSourceDir)) {
              try {
                copyRecursively(fontSourceDir, fontTargetDir);
                console.log("✅ Font files copy process completed");
              } catch (error) {
                console.error("❌ Error during font copy process:");
                console.error("   Message:", error.message);
                console.error("   Stack:", error.stack);
              }
            } else {
              console.log(
                `❌ Font source directory does not exist: ${fontSourceDir}`
              );
            }
          });
        },
      },
    ];

    if (!isDevelopment) {
      console.log(`   🧹 Adding PurgeCSS for ${entryName}`);
      const entryConfig = entries[entryName];

      if (!entryConfig.skipPurge) {
        const safeSelectors = Array.isArray(selectors) ? selectors : [];
        console.log(
          `   Processing ${safeSelectors.length} selectors for PurgeCSS`
        );

        plugins.push(
          new PurgeCSSPlugin({
            paths: purgePaths,
            safelist: {
              standard: safeSelectors.map((selector) =>
                selector.replace(/^\./, "")
              ),
              deep: [/^\./, /^:/, /^&/],
              greedy: [/^\.fa-/, /^\.bs-/, /^\.heading-/, /^\.iconlist/],
            },
            defaultExtractor: (content) =>
              content.match(/[A-Za-z0-9-_:\/]+/g) || [],
            variables: true,
            rejected: true,
            printAll: true,
            keyframes: true,
            fontFace: true,
            blocklist: [],
          })
        );
      } else {
        console.log(`   🚫 Skipping PurgeCSS for ${entryName}`);
      }
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
            use: {
              loader: "babel-loader",
              options: {
                cacheDirectory: true,
              },
            },
            exclude: /node_modules/,
          },
          {
            test: /\.(css|sass|scss)$/u,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  emit: true,
                },
              },
              {
                loader: "css-loader",
                options: {
                  url: false,
                  sourceMap: isDevelopment,
                },
              },
              // No need for font removal here since we handle it after critical extraction.
              {
                loader: "sass-loader",
                options: {
                  sourceMap: isDevelopment,
                  additionalData: (content, loaderContext) => {
                    console.log(
                      "🎨 Processing SCSS:",
                      path.relative(process.cwd(), loaderContext.resourcePath)
                    );
                    return content;
                  },
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
        extensions: [".js", ".json", ".css", ".scss", ".sass"],
        alias: {
          "@css": path.resolve(__dirname, "wwwroot/css"),
          "@js": path.resolve(__dirname, "wwwroot/js"),
          "@scss": path.resolve(__dirname, "wwwroot/sass"),
        },
      },
    };
  };

  console.log("\n🔨 Creating webpack configurations");
  const configs = Object.entries(entries).map(([entryName, entryConfig]) => {
    console.log(`\n📦 Creating config for: ${entryName}`);
    return createEntryConfig(entryName, entryConfig);
  });

  return configs;
};
