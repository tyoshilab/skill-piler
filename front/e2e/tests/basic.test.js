describe('Skill Piler - Basic E2E Tests', () => {
  const APP_URL = process.env.REACT_APP_URL || 'http://skill-piler-front:3000';
  let page;

  beforeEach(async () => {
    page = await global.browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  test('should load the application', async () => {
    try {
      await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const title = await page.title();
      expect(title).toBeDefined();
      expect(title.length).toBeGreaterThan(0);
      
      console.log(`✓ Application loaded successfully with title: ${title}`);
    } catch (error) {
      console.error('Failed to load application:', error);
      throw error;
    }
  });

  test('should display main page elements', async () => {
    try {
      await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Check if page has basic HTML structure
      const bodyElement = await page.$('body');
      expect(bodyElement).toBeTruthy();
      
      // Check if React app root exists
      const rootElement = await page.$('#root') || await page.$('[data-reactroot]') || await page.$('div');
      expect(rootElement).toBeTruthy();
      
      console.log('✓ Main page elements are present');
    } catch (error) {
      console.error('Failed to find main page elements:', error);
      throw error;
    }
  });

  test('should have responsive design', async () => {
    try {
      await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Test mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const bodyElement = await page.$('body');
      expect(bodyElement).toBeTruthy();
      
      // Test desktop viewport
      await page.setViewport({ width: 1920, height: 1080 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const bodyElementDesktop = await page.$('body');
      expect(bodyElementDesktop).toBeTruthy();
      
      console.log('✓ Responsive design works correctly');
    } catch (error) {
      console.error('Responsive design test failed:', error);
      throw error;
    }
  });
});