const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const xml2js = require('xml2js');

async function renderPagesFromSitemap() {
    const sitemapXml = await fs.readFile(path.join(__dirname, 'wwwroot/sitemap.xml'), 'utf-8');
    const parser = new xml2js.Parser();
    const sitemap = await parser.parseStringPromise(sitemapXml);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    try {
        for (const urlElement of sitemap.urlset.url) {
            const fullUrl = urlElement.loc[0];
            const pathPart = fullUrl.replace('https://estudiolopezgiacomelli.com.ar/', '');
            const fileName = pathPart || 'index';
            
            const localUrl = `http://localhost:5000/${pathPart}`;
            
            const filePath = path.join(__dirname, 'wwwroot/rendered', fileName + '.html');
            const dirPath = path.dirname(filePath);
            
            await fs.mkdir(dirPath, { recursive: true });
            
            await page.goto(localUrl, { waitUntil: 'networkidle0' });
            const html = await page.content();
            
            await fs.writeFile(filePath, html);
            console.log(`Rendered ${fileName}.html`);
        }
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }

    await browser.close();
}

renderPagesFromSitemap();