const puppeteer = require('puppeteer');

// Global browser instance
global.browser = null;

beforeAll(async () => {
  global.browser = await puppeteer.launch({
    args: [
      "--no-sandbox", 
      "--disable-setuid-sandbox", 
      "--disable-dev-shm-usage"
    ],
    headless: true
  });
}, 30000);

afterAll(async () => {
  if (global.browser) {
    await global.browser.close();
  }
});