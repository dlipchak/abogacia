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
  "./wwwroot/js/plugins.swiper.js",
  "./wwwroot/js/plugins.bootstrap.js",
  "./wwwroot/js/modules/stickfooteronsmall.js",
  "./wwwroot/js/modules/gototop.js",
  "./wwwroot/js/modules/logo.js",
  "./wwwroot/js/modules/bscomponents.js",
  "./wwwroot/js/modules/headers.js",
  "./wwwroot/js/modules/menus.js",
  "./wwwroot/js/modules/sliderdimensions.js",
  "./wwwroot/js/modules/bootstrap.js",
];

function cleanDistFolder() {
  const distPath = path.resolve(__dirname, "wwwroot/dist");
  if (fs.existsSync(distPath)) {
    rmSync(distPath, { recursive: true, force: true });
    console.log("Cleaned wwwroot/dist folder");
  }
}

module.exports = (env, argv) => {
  cleanDistFolder();

  const isDevelopment = argv.mode === "development";
  const hash = isDevelopment ? "" : ".[contenthash:8]";

  const entries = {
    calculatorWorkDismissal: {
      entry: "./wwwroot/js/pages/calculatorWorkDismissal/index.js",
      url: "http://localhost:5000/calculadoras/despidos",
      purgePaths: glob.sync([
        "./views/Calculators/calculatorWorkDismissal.cshtml",
        "./views/Calculators/partials/**/*.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    calculatorWorkAccident: {
      entry: "./wwwroot/js/pages/calculatorWorkAccident/index.js",
      url: "http://localhost:5000/calculadoras/accidentes-laborales",
      purgePaths: glob.sync([
        "./views/Calculators/calculatorWorkAccident.cshtml",
        "./views/Calculators/partials/**/*.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    calculatorTrafficAccident: {
      entry: "./wwwroot/js/pages/calculatorTrafficAccident/index.js",
      url: "http://localhost:5000/calculadoras/accidentes-de-transito",
      purgePaths: glob.sync([
        "./views/Calculators/CalculatorTrafficAccident.cshtml",
        "./views/Calculators/partials/**/*.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    faqDismissal: {
      entry: "./wwwroot/js/pages/faqDismissal/index.js",
      url: "http://localhost:5000/preguntas-frecuentes/despidos",
      purgePaths: glob.sync([
        "./views/FAQ/DismissalsFaq.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    faqTrafficAccident: {
      entry: "./wwwroot/js/pages/faqTrafficAccident/index.js",
      url: "http://localhost:5000/preguntas-frecuentes/accidentes-de-transito",
      purgePaths: glob.sync([
        "./views/FAQ/TrafficAccidentFaq.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    faqWorkAccident: {
      entry: "./wwwroot/js/pages/faqWorkAccident/index.js",
      url: "http://localhost:5000/preguntas-frecuentes/accidentes-laborales",
      purgePaths: glob.sync([
        "./views/FAQ/WorkAccidentFaq.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    contactUs: {
      entry: "./wwwroot/js/pages/contactUs/index.js",
      url: "http://localhost:5000/contacto",
      purgePaths: glob.sync([
        "./views/ContactUs/ContactUs.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    workerRights: {
      entry: "./wwwroot/js/pages/workerRights/index.js",
      url: "http://localhost:5000/derechos-laborales",
      purgePaths: glob.sync([
        "./views/Dismissals/WorkerRights.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    articles: {
      entry: "./wwwroot/js/pages/articles/index.js",
      url: "http://localhost:5000/guias",
      purgePaths: glob.sync([
        "./views/Articles/Articles.cshtml",
        "./views/Articles/ArticlesHeader.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    accidentesEnTransportePublico: {
      entry: "./wwwroot/js/pages/articles/index.js",
      url: "http://localhost:5000/guias/accidentes-en-transporte-publico",
      purgePaths: glob.sync([
        "./views/Articles/AccidentesEnTransportePublico.cshtml",
        "./views/Articles/ArticlesHeader.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    accidentesEnAuto: {
      entry: "./wwwroot/js/pages/articles/index.js",
      url: "http://localhost:5000/guias/accidentes-en-auto",
      purgePaths: glob.sync([
        "./views/Articles/AccidentesEnAuto.cshtml",
        "./views/Articles/ArticlesHeader.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    accidentesEnMoto: {
      entry: "./wwwroot/js/pages/articles/index.js",
      url: "http://localhost:5000/guias/accidentes-en-moto",
      purgePaths: glob.sync([
        "./views/Articles/AccidentesEnMoto.cshtml",
        "./views/Articles/ArticlesHeader.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    accidentesEnBicicleta: {
      entry: "./wwwroot/js/pages/articles/index.js",
      url: "http://localhost:5000/guias/accidentes-en-bicicleta",
      purgePaths: glob.sync([
        "./views/Articles/AccidentesEnBicicleta.cshtml",
        "./views/Articles/ArticlesHeader.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    accidentesComoAcompanantes: {
      entry: "./wwwroot/js/pages/articles/index.js",
      url: "http://localhost:5000/guias/accidentes-como-acompanantes",
      purgePaths: glob.sync([
        "./views/Articles/AccidentesComoAcompanantes.cshtml",
        "./views/Articles/ArticlesHeader.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    accidentesComoPeaton: {
      entry: "./wwwroot/js/pages/articles/index.js",
      url: "http://localhost:5000/guias/accidentes-como-peaton",
      purgePaths: glob.sync([
        "./views/Articles/AccidentesComoPeaton.cshtml",
        "./views/Articles/ArticlesHeader.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    destruccionTotal: {
      entry: "./wwwroot/js/pages/articles/index.js",
      url: "http://localhost:5000/guias/destruccion-total",
      purgePaths: glob.sync([
        "./views/Articles/DestruccionTotal.cshtml",
        "./views/Articles/ArticlesHeader.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    accidentesDeTrabajo: {
      entry: "./wwwroot/js/pages/articles/index.js",
      url: "http://localhost:5000/guias/accidentes-de-trabajo",
      purgePaths: glob.sync([
        "./views/Articles/AccidentesDeTrabajo.cshtml",
        "./views/Articles/ArticlesHeader.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    accidentesInItinere: {
      entry: "./wwwroot/js/pages/articles/index.js",
      url: "http://localhost:5000/guias/accidentes-in-itinere",
      purgePaths: glob.sync([
        "./views/Articles/AccidentesInItinere.cshtml",
        "./views/Articles/ArticlesHeader.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    enfermedadesProfesionales: {
      entry: "./wwwroot/js/pages/articles/index.js",
      url: "http://localhost:5000/guias/enfermedades-profesionales",
      purgePaths: glob.sync([
        "./views/Articles/EnfermedadesProfesionales.cshtml",
        "./views/Articles/ArticlesHeader.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    comoActuarAnteUnAccidenteDeTransito: {
      entry: "./wwwroot/js/pages/articles/index.js",
      url:
        "http://localhost:5000/guias/como-actuar-ante-un-accidente-de-transito",
      purgePaths: glob.sync([
        "./views/Articles/HowToActOnTrafficAccident.cshtml",
        "./views/Articles/ArticlesHeader.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
    covid19: {
      entry: "./wwwroot/js/pages/articles/index.js",
      url: "http://localhost:5000/guias/covid19",
      purgePaths: glob.sync([
        "./views/Articles/Covid19.cshtml",
        "./views/Articles/ArticlesHeader.cshtml",
        "./views/Shared/CalculatorsLinks.cshtml",
        ...commonPurgePaths,
      ]),
      selectors: [],
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
        "./wwwroot/js/modules/canvasslider.js",
        "./wwwroot/js/modules/sliderparallax.js",
        "./wwwroot/js/modules/animations.js",
        ...commonPurgePaths,
      ]),
      selectors: [],
    },
  };

  const safeParseJSON = (jsonString) => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Error parsing JSON:", error.message);
      return [];
    }
  };

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

        const selectors = safeParseJSON(rawOutput);

        entries[key].selectors = selectors;
      } catch (error) {
        console.error(
          `Failed to extract selectors for ${key} (${url}):`,
          error.message
        );
        entries[key].selectors = [];
      }
    });
  }

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

            if (fs.existsSync(manifestPath)) {
              try {
                existingManifest = JSON.parse(
                  fs.readFileSync(manifestPath, "utf-8")
                );
              } catch (error) {
                console.error("Failed to parse existing manifest:", error);
              }
            }

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

            const updatedManifest = { ...existingManifest, ...newManifest };

            fs.writeFileSync(
              manifestPath,
              JSON.stringify(updatedManifest, null, 2)
            );
          });
        },
      },
    ];

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

  const configs = Object.entries(entries).map(([entryName, entryConfig]) =>
    createEntryConfig(entryName, entryConfig)
  );

  return configs;
};
