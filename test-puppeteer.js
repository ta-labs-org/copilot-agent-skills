const puppeteer = require('puppeteer');

async function runTests() {
    const browser = await puppeteer.launch({ headless: false }); // ヘッドレスオフでブラウザ表示
    const page = await browser.newPage();
    await page.goto('http://localhost:8000/index.html');

    // テスト実行を待つ
    await page.waitForTimeout(2000);

    // コンソールログを取得
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    // テスト関数を実行
    await page.evaluate(() => {
        runTests();
    });

    // 少し待つ
    await page.waitForTimeout(1000);

    console.log('テスト結果:');
    logs.forEach(log => console.log(log));

    // ゲームの動作確認（簡易）
    const scoreElement = await page.$('#score');
    const livesElement = await page.$('#lives');
    const scoreText = await page.evaluate(el => el.textContent, scoreElement);
    const livesText = await page.evaluate(el => el.textContent, livesElement);

    console.log(`初期スコア: ${scoreText}`);
    console.log(`初期ライフ: ${livesText}`);

    // スペースキーでゲーム開始
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);

    // 右矢印キーでパドル移動
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    // 現在のスコアとライフを確認
    const newScoreText = await page.evaluate(el => el.textContent, scoreElement);
    const newLivesText = await page.evaluate(el => el.textContent, livesElement);

    console.log(`ゲーム開始後スコア: ${newScoreText}`);
    console.log(`ゲーム開始後ライフ: ${newLivesText}`);

    await browser.close();
}

runTests().catch(console.error);