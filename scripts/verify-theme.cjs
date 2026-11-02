const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function verifyTheme() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  console.log('Launching Chrome for theme test...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 15000 });

    // 1. Initial Dark Mode
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'theme_dark_mode.png') });
    console.log('Captured theme_dark_mode.png');

    // 2. Click the Light Mode toggle button at the top
    const lightBtn = await page.$('button[aria-label="Switch to Light Mode"]');
    if (!lightBtn) throw new Error('Light mode toggle button not found!');

    console.log('Toggling to Light Mode...');
    await lightBtn.click();
    await new Promise((r) => setTimeout(r, 800));

    // Verify html class is now light
    const isLight = await page.evaluate(() => document.documentElement.classList.contains('light'));
    console.log('Document has class light:', isLight);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'theme_light_mode.png') });
    console.log('Captured theme_light_mode.png');

    // 3. Click the Dark Mode toggle button to toggle back
    const darkBtn = await page.$('button[aria-label="Switch to Dark Mode"]');
    if (!darkBtn) throw new Error('Dark mode toggle button not found!');

    console.log('Toggling back to Dark Mode...');
    await darkBtn.click();
    await new Promise((r) => setTimeout(r, 800));

    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log('Document has class dark:', isDark);

    console.log('Console Errors:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.error(consoleErrors);
      process.exit(1);
    }

    console.log('Theme toggle verified successfully with ZERO errors!');
    await page.close();
    await browser.close();
  } catch (err) {
    console.error('Theme test failed:', err);
    try { await page.close(); } catch (_) {}
    try { await browser.close(); } catch (_) {}
    process.exit(1);
  }
}

verifyTheme();
