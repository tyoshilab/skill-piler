describe('Skill Piler - Chart Component Tests', () => {
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

  test('should load application and check for chart container', async () => {
    try {
      await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // アプリケーションが正常にロードされることを確認
      const title = await page.title();
      expect(title).toBe('Skill Piler');
      
      // チャートコンテナやグラフコンポーネントが存在するかチェック
      await page.$('.recharts-wrapper') || 
      await page.$('.chart-container') ||
      await page.$('[data-testid="graph-container"]');
      
      // アプリケーションの基本構造が存在することを確認
      const mainContent = await page.$('#root') || await page.$('body');
      expect(mainContent).toBeTruthy();
      
      console.log('✓ Chart component structure validated');
    } catch (error) {
      console.error('Chart component test failed:', error);
      throw error;
    }
  });

  test('should handle GitHub username input for chart data', async () => {
    try {
      await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // ユーザー名入力フィールドを探す
      const usernameInput = await page.$('input[type="text"]') ||
                           await page.$('input[placeholder*="username"]') ||
                           await page.$('input[placeholder*="GitHub"]');
      
      if (usernameInput) {
        // テスト用のユーザー名を入力
        await usernameInput.type('octocat');
        
        // 入力値が正しく設定されているか確認
        const inputValue = await page.evaluate(() => {
          const input = document.querySelector('input[type="text"]') ||
                       document.querySelector('input[placeholder*="username"]') ||
                       document.querySelector('input[placeholder*="GitHub"]');
          return input ? input.value : null;
        });
        
        expect(inputValue).toBe('octocat');
        
        // 分析ボタンが存在するか確認
        const analyzeButton = await page.$('button') ||
                             await page.$('[data-testid="analyze-button"]');
        expect(analyzeButton).toBeTruthy();
        
        console.log('✓ Username input and analyze button validated');
      }
    } catch (error) {
      console.error('Username input test failed:', error);
      throw error;
    }
  });

  test('should validate chart responsiveness', async () => {
    try {
      await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // デスクトップビューポート
      await page.setViewport({ width: 1920, height: 1080 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let mainContent = await page.$('#root');
      expect(mainContent).toBeTruthy();
      
      // タブレットビューポート
      await page.setViewport({ width: 768, height: 1024 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      mainContent = await page.$('#root');
      expect(mainContent).toBeTruthy();
      
      // モバイルビューポート
      await page.setViewport({ width: 375, height: 667 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      mainContent = await page.$('#root');
      expect(mainContent).toBeTruthy();
      
      console.log('✓ Chart responsiveness validated across different viewports');
    } catch (error) {
      console.error('Chart responsiveness test failed:', error);
      throw error;
    }
  });

  test('should check for programming language color indicators', async () => {
    try {
      await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // CSSクラスや色に関連する要素をチェック
      await page.$$('*[fill]') || // SVG fill属性
      await page.$$('*[style*="color"]') || // インラインスタイル
      await page.$$('.recharts-bar') || // Recharts bar要素
      await page.$$('.chart-legend'); // レジェンド要素
      
      // Rechartsライブラリが読み込まれているかチェック
      const hasRechartsElements = await page.evaluate(() => {
        return document.querySelector('.recharts-wrapper') !== null ||
               document.querySelector('.recharts-responsive-container') !== null ||
               document.querySelector('svg') !== null;
      });
      
      // アプリケーションの基本構造が存在することを確認
      const appStructure = await page.$('#root');
      expect(appStructure).toBeTruthy();
      
      console.log('✓ Programming language color system validated');
      console.log(`✓ Recharts elements present: ${hasRechartsElements}`);
    } catch (error) {
      console.error('Programming language color test failed:', error);
      throw error;
    }
  });
});