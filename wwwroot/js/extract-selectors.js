const puppeteer = require("puppeteer");

(async () => {
    // Get the URL from the command line arguments
    const url = process.argv[2];

    if (!url) {
        process.stderr.write(JSON.stringify({ error: "Please provide a URL as an argument." }));
        process.exit(1);
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({
        headless: true, // Set to false if you want to see the browser
        defaultViewport: null, // Full page
    });

    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: "networkidle2" });

        // Extract all class names from the DOM
        const selectors = await page.evaluate(() => {
            const allSelectors = new Set();

            // Traverse all elements in the DOM
            document.querySelectorAll("*").forEach((el) => {
                el.classList.forEach((cls) => allSelectors.add(`.${cls}`)); // Add class with a dot prefix
            });

            return Array.from(allSelectors); // Convert Set to Array
        });

        // Output only JSON
        process.stdout.write(JSON.stringify(selectors, null, 2));
    } catch (error) {
        // Output error as JSON
        process.stderr.write(JSON.stringify({ error: error.message }));
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
