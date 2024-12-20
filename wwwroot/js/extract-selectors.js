const puppeteer = require("puppeteer");

(async () => {
  const url = process.argv[2];
  if (!url) {
    process.stderr.write(
      JSON.stringify({ error: "Please provide a URL as an argument." })
    );
    process.exit(1);
  }

  const viewports = [
    { width: 375, height: 640, name: "mobile" },
    { width: 768, height: 800, name: "tablet" },
    { width: 1366, height: 768, name: "desktop" },
  ];

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  try {
    const criticalData = {};
    const allSelectors = new Set();

    for (const viewport of viewports) {
      await page.setViewport({
        width: viewport.width,
        height: viewport.height,
      });

      await page.goto(url, { waitUntil: "networkidle2" });

      const viewportData = await page.evaluate(() => {
        function isElementInViewport(element) {
          const rect = element.getBoundingClientRect();
          return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <=
              (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <=
              (window.innerWidth || document.documentElement.clientWidth)
          );
        }

        function getSelector(el) {
          let selector = el.tagName.toLowerCase();
          if (el.id) selector += `#${el.id}`;
          if (el.classList.length) {
            selector += `.${Array.from(el.classList).join(".")}`;
          }
          return selector;
        }

        const criticalStyles = new Set();

        // Only select elements visible in the viewport and critical for initial render
        const criticalSelectors = [
          "body",
          "#wrapper",
          "#header",
          "#header-wrap",
          "#logo",
          "#logo img",
          ".container",
          ".row",
          "#hero-title",
          "#hero-title h1",
          "#hero-title h2",
          ".heroHeader",
          ":root",
          ".d-flex",
          ".align-items-center",
          ".justify-content-center",
        ];

        document.querySelectorAll(criticalSelectors.join(",")).forEach((el) => {
          if (isElementInViewport(el)) {
            const styles = getComputedStyle(el);
            let cssText = "";

            const criticalProps = [
              "display",
              "position",
              "width",
              "height",
              "margin",
              "padding",
              "background",
              "color",
              "font-size",
              "font-family",
              "line-height",
            ];

            criticalProps.forEach((prop) => {
              const value = styles.getPropertyValue(prop);
              if (value && value !== "none" && value !== "auto") {
                cssText += `${prop}:${value};`;
              }
            });

            if (cssText) {
              criticalStyles.add(`${getSelector(el)}{${cssText}}`);
            }
          }
        });

        return {
          selectors: Array.from(document.querySelectorAll("*"))
            .map((el) => el.className)
            .join(" ")
            .split(/\s+/)
            .filter(Boolean),
          criticalStyles: Array.from(criticalStyles),
        };
      });

      criticalData[viewport.name] = {
        styles: viewportData.criticalStyles.join("\n"),
      };

      viewportData.selectors.forEach((selector) => allSelectors.add(selector));
    }

    const results = {
      selectors: Array.from(allSelectors),
      critical: criticalData,
    };

    process.stdout.write(JSON.stringify(results, null, 2));
  } catch (error) {
    process.stderr.write(JSON.stringify({ error: error.message }));
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
