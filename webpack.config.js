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

const SOURCE_DIR = "./src";
const VIEWS_DIR = "./views";
const WWWROOT_DIR = "./wwwroot";
const DIST_DIR = `${WWWROOT_DIR}/dist`;

const commonPurgePaths = [
  `${VIEWS_DIR}/shared/_Layout.cshtml`,
  `${VIEWS_DIR}/shared/Header.cshtml`,
  `${VIEWS_DIR}/shared/Footer.cshtml`,
  `${VIEWS_DIR}/shared/GoogleReviewsPartial.cshtml`,
  `${VIEWS_DIR}/shared/_HeroSection.cshtml`,
  `${SOURCE_DIR}/js/modules/lazyload.js`,
  `${SOURCE_DIR}/js/plugins.bootstrap.js`,
  `${SOURCE_DIR}/js/modules/stickfooteronsmall.js`,
  `${SOURCE_DIR}/js/modules/gototop.js`,
  `${SOURCE_DIR}/js/modules/logo.js`,
  `${SOURCE_DIR}/js/modules/bscomponents.js`,
  `${SOURCE_DIR}/js/modules/headers.js`,
  `${SOURCE_DIR}/js/modules/menus.js`,
  `${SOURCE_DIR}/js/modules/sliderdimensions.js`,
  `${SOURCE_DIR}/js/modules/bootstrap.js`,
  `${SOURCE_DIR}/js/modules/pagetransition.js`,
];

function cleanDistFolder() {
  const distPath = path.resolve(__dirname, DIST_DIR);
  if (fs.existsSync(distPath)) {
    console.log("🧹 Cleaning dist folder:", distPath);
    rmSync(distPath, { recursive: true, force: true });
    console.log(`✅ Cleaned ${DIST_DIR} folder`);
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

  const mappingPath = path.resolve(__dirname, `${SOURCE_DIR}/url-mapping.json`);
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log("Generated URL mapping");
}

async function generateCriticalCSS(url, entryName, entries) {
  console.log(`\n🎯 Generating Critical CSS for ${entryName}`);
  console.log(`   🌐 URL: ${url}`);

  // Read the manifest
  const manifestPath = path.resolve(
    __dirname,
    `${SOURCE_DIR}/rev-manifest.json`
  );
  console.log("   📖 Reading manifest file");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

  // Get the hashed filename from manifest
  const hashedCssFileName = manifest[`${entryName}.css`];
  if (!hashedCssFileName) {
    throw new Error(`No CSS file found in manifest for ${entryName}`);
  }

  console.log(`Looking for CSS file: ${hashedCssFileName}`); // Debug log

  const cssFile = path.resolve(__dirname, `${DIST_DIR}/${hashedCssFileName}`);
  const criticalDir = path.resolve(__dirname, `${DIST_DIR}/critical`);

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
          base: `${DIST_DIR}/`,
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
    // page404: {
    //   entry: `${SOURCE_DIR}/js/pages/error/index.js`,
    //   url: "http://localhost:5000/fdfsfsas",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Page404.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // calculatorWorkDismissal: {
    //   entry: `${SOURCE_DIR}/js/pages/calculatorWorkDismissal/index.js`,
    //   url: "http://localhost:5000/calculadoras/despidos",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Calculators/calculatorWorkDismissal.cshtml`,
    //     `${VIEWS_DIR}/Calculators/partials/**/*.cshtml`,
    //     `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // calculatorWorkAccident: {
    //   entry: `${SOURCE_DIR}/js/pages/calculatorWorkAccident/index.js`,
    //   url: "http://localhost:5000/calculadoras/accidentes-laborales",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Calculators/calculatorWorkAccident.cshtml`,
    //     `${VIEWS_DIR}/Calculators/partials/**/*.cshtml`,
    //     `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // calculatorTrafficAccident: {
    //   entry: `${SOURCE_DIR}/js/pages/calculatorTrafficAccident/index.js`,
    //   url: "http://localhost:5000/calculadoras/accidentes-de-transito",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Calculators/CalculatorTrafficAccident.cshtml`,
    //     `${VIEWS_DIR}/Calculators/partials/**/*.cshtml`,
    //     `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // faqDismissal: {
    //   entry: `${SOURCE_DIR}/js/pages/faqDismissal/index.js`,
    //   url: "http://localhost:5000/preguntas-frecuentes/despidos",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/FAQ/DismissalsFaq.cshtml`,
    //     `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // faqTrafficAccident: {
    //   entry: `${SOURCE_DIR}/js/pages/faqTrafficAccident/index.js`,
    //   url: "http://localhost:5000/preguntas-frecuentes/accidentes-de-transito",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/FAQ/TrafficAccidentFaq.cshtml`,
    //     `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // faqWorkAccident: {
    //   entry: `${SOURCE_DIR}/js/pages/faqWorkAccident/index.js`,
    //   url: "http://localhost:5000/preguntas-frecuentes/accidentes-laborales",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/FAQ/WorkAccidentFaq.cshtml`,
    //     `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // contactUs: {
    //   entry: `${SOURCE_DIR}/js/pages/contactUs/index.js`,
    //   url: "http://localhost:5000/contacto",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/ContactUs/ContactUs.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    //   additionalUrls: ["/Contacto", "/contacto"],
    // },
    // workerRights: {
    //   entry: `${SOURCE_DIR}/js/pages/workerRights/index.js`,
    //   url: "http://localhost:5000/despidos/derechos-del-trabajador",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Dismissals/WorkerRights.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // articles: {
    //   entry: `${SOURCE_DIR}/js/pages/articles/index.js`,
    //   url: "http://localhost:5000/guias",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Articles/Articles.cshtml`,
    //     `${VIEWS_DIR}/Articles/ArticlesHeader.cshtml`,
    //     `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // accidentesEnTransportePublico: {
    //   entry: `${SOURCE_DIR}/js/pages/articles/index.js`,
    //   url: "http://localhost:5000/guias/accidentes-en-transporte-publico",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Articles/AccidentesEnTransportePublico.cshtml`,
    //     `${VIEWS_DIR}/Articles/ArticlesHeader.cshtml`,
    //     `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // accidentesEnAuto: {
    //   entry: `${SOURCE_DIR}/js/pages/articles/index.js`,
    //   url: "http://localhost:5000/guias/accidentes-en-auto",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Articles/AccidentesEnAuto.cshtml`,
    //     `${VIEWS_DIR}/Articles/ArticlesHeader.cshtml`,
    //     `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // accidentesEnMoto: {
    //   entry: `${SOURCE_DIR}/js/pages/articles/index.js`,
    //   url: "http://localhost:5000/guias/accidentes-en-moto",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Articles/AccidentesEnMoto.cshtml`,
    //     `${VIEWS_DIR}/Articles/ArticlesHeader.cshtml`,
    //     `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // accidentesEnBicicleta: {
    //   entry: `${SOURCE_DIR}/js/pages/articles/index.js`,
    //   url: "http://localhost:5000/guias/accidentes-en-bicicleta",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Articles/AccidentesEnBicicleta.cshtml`,
    //     `${VIEWS_DIR}/Articles/ArticlesHeader.cshtml`,
    //     `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // accidentesComoAcompanantes: {
    //   entry: `${SOURCE_DIR}/js/pages/articles/index.js`,
    //   url: "http://localhost:5000/guias/accidentes-como-acompanantes",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Articles/AccidentesComoAcompanantes.cshtml`,
    //     `${VIEWS_DIR}/Articles/ArticlesHeader.cshtml`,
    //     `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // accidentesComoPeaton: {
    //   entry: `${SOURCE_DIR}/js/pages/articles/index.js`,
    //   url: "http://localhost:5000/guias/accidentes-como-peaton",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Articles/AccidentesComoPeaton.cshtml`,
    //     `${VIEWS_DIR}/Articles/ArticlesHeader.cshtml`,
    //     `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // destruccionTotal: {
    //   entry: `${SOURCE_DIR}/js/pages/articles/index.js`,
    //   url: "http://localhost:5000/guias/destruccion-total",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Articles/DestruccionTotal.cshtml`,
    //     `${VIEWS_DIR}/Articles/ArticlesHeader.cshtml`,
    //     `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // accidentesDeTrabajo: {
    //   entry: `${SOURCE_DIR}/js/pages/articles/index.js`,
    //   url: "http://localhost:5000/guias/accidentes-de-trabajo",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Articles/AccidentesDeTrabajo.cshtml`,
    //     `${VIEWS_DIR}/Articles/ArticlesHeader.cshtml`,
    //     `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // accidentesInItinere: {
    //   entry: `${SOURCE_DIR}/js/pages/articles/index.js`,
    //   url: "http://localhost:5000/guias/accidentes-in-itinere",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Articles/AccidentesInItinere.cshtml`,
    //     `${VIEWS_DIR}/Articles/ArticlesHeader.cshtml`,
    //     `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // enfermedadesProfesionales: {
    //   entry: `${SOURCE_DIR}/js/pages/articles/index.js`,
    //   url: "http://localhost:5000/guias/enfermedades-profesionales",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Articles/EnfermedadesProfesionales.cshtml`,
    //     `${VIEWS_DIR}/Articles/ArticlesHeader.cshtml`,
    //     `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // comoActuarAnteUnAccidenteDeTransito: {
    //   entry: `${SOURCE_DIR}/js/pages/articles/index.js`,
    //   url:
    //     "http://localhost:5000/guias/como-actuar-ante-un-accidente-de-transito",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Articles/HowToActOnTrafficAccident.cshtml`,
    //     `${VIEWS_DIR}/Articles/ArticlesHeader.cshtml`,
    //     `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // covid19: {
    //   entry: `${SOURCE_DIR}/js/pages/articles/index.js`,
    //   url: "http://localhost:5000/guias/covid19",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Articles/Covid19.cshtml`,
    //     `${VIEWS_DIR}/Articles/ArticlesHeader.cshtml`,
    //     `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    // },
    // blog: {
    //   entry: `${SOURCE_DIR}/js/pages/blog/index.js`,
    //   url: "http://localhost:5000/novedades",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Blog.cshtml`,
    //     `${VIEWS_DIR}/BlogEntry.cshtml`,
    //     `${VIEWS_DIR}/BlogEntryCategory.cshtml`,
    //     `${VIEWS_DIR}/Shared/_BlogSidebar.cshtml`,
    //     `${VIEWS_DIR}/Shared/_Layout.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    //   criticalOptions: {
    //     rejectUnauthorized: false,
    //   },
    // },
    // blogEntryCategory: {
    //   entry: `${SOURCE_DIR}/js/pages/blog/index.js`,
    //   url: "http://localhost:5000/novedades/accidentes-laborales/",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Blog.cshtml`,
    //     `${VIEWS_DIR}/BlogEntry.cshtml`,
    //     `${VIEWS_DIR}/BlogEntryCategory.cshtml`,
    //     `${VIEWS_DIR}/Shared/_BlogSidebar.cshtml`,
    //     `${VIEWS_DIR}/Shared/_Layout.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    //   criticalOptions: {
    //     rejectUnauthorized: false,
    //   },
    // },
    // blogEntry: {
    //   entry: `${SOURCE_DIR}/js/pages/blog/entry.js`,
    //   url: "http://localhost:5000/novedades/accidentes-laborales/articulo-1/",
    //   purgePaths: glob.sync([
    //     `${VIEWS_DIR}/Blog.cshtml`,
    //     `${VIEWS_DIR}/BlogEntry.cshtml`,
    //     `${VIEWS_DIR}/BlogEntryCategory.cshtml`,
    //     `${VIEWS_DIR}/Shared/_BlogSidebar.cshtml`,
    //     `${VIEWS_DIR}/Shared/_Layout.cshtml`,
    //     ...commonPurgePaths,
    //   ]),
    //   selectors: [],
    //   criticalOptions: {
    //     rejectUnauthorized: false,
    //   },
    // },
    home: {
      entry: `${SOURCE_DIR}/js/pages/home/index.js`,
      url: "http://localhost:5000/",
      purgePaths: glob.sync([
        `${VIEWS_DIR}/Home/home.cshtml`,
        `${VIEWS_DIR}/Home/galleryPartial.cshtml`,
        `${VIEWS_DIR}/Shared/CalculatorsLinks.cshtml`,
        `${SOURCE_DIR}/css/reviews.css`,
        `${SOURCE_DIR}/css/swiper.css`,
        `${SOURCE_DIR}/js/plugins.swiper.js`,
        `${SOURCE_DIR}/js/modules/canvasslider.js`,
        `${SOURCE_DIR}/js/modules/sliderparallax.js`,
        `${SOURCE_DIR}/js/modules/animations.js`,
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
          `${SOURCE_DIR}/js/extract-selectors.js`
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
              `${SOURCE_DIR}/rev-manifest.json`
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
                `${DIST_DIR}/${hashedCssFileName}`
              );

              if (fs.existsSync(cssFile)) {
                console.log(`   ✅ CSS file found: ${hashedCssFileName}`);
                const entryUrl = entries[entryName].url;
                await generateCriticalCSS(entryUrl, entryName, entries);
              } else {
                console.error(`   ❌ CSS file not found: ${cssFile}`);
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
            const sourceDir = path.resolve(
              __dirname,
              `${SOURCE_DIR}/js/compressed`
            );
            const targetDir = path.resolve(__dirname, DIST_DIR);

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
            const fontSourceDir = path.resolve(
              __dirname,
              `${SOURCE_DIR}/css/icons`
            );
            const fontTargetDir = path.resolve(__dirname, `${DIST_DIR}`);

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
        path: path.resolve(__dirname, DIST_DIR),
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
          "@css": path.resolve(__dirname, `${SOURCE_DIR}/css`),
          "@js": path.resolve(__dirname, `${SOURCE_DIR}/js`),
          "@scss": path.resolve(__dirname, `${SOURCE_DIR}/sass`),
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
