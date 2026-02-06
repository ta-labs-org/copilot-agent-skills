// テストコード: ブロック崩しゲームのテスト
// シンプルなコンソールテスト

// テスト1: Canvas要素の取得
function testCanvasElement() {
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
        console.log('✓ Canvas要素が正しく取得できました');
        return true;
    } else {
        console.log('✗ Canvas要素が見つかりません');
        return false;
    }
}

// テスト2: ゲームクラスの初期化
function testGameInitialization() {
    // ゲームクラスが定義されているか確認
    if (typeof Game !== 'undefined') {
        console.log('✓ Gameクラスが定義されています');
        return true;
    } else {
        console.log('✗ Gameクラスが定義されていません');
        return false;
    }
}

// テスト3: パドルクラスの初期化
function testPaddleInitialization() {
    if (typeof Paddle !== 'undefined') {
        console.log('✓ Paddleクラスが定義されています');
        return true;
    } else {
        console.log('✗ Paddleクラスが定義されていません');
        return false;
    }
}

// テスト4: ボールクラスの初期化
function testBallInitialization() {
    if (typeof Ball !== 'undefined') {
        console.log('✓ Ballクラスが定義されています');
        return true;
    } else {
        console.log('✗ Ballクラスが定義されていません');
        return false;
    }
}

// テスト実行
function runTests() {
    console.log('テストを開始します...');
    let passed = 0;
    let total = 4;

    if (testCanvasElement()) passed++;
    if (testGameInitialization()) passed++;
    if (testPaddleInitialization()) passed++;
    if (testBallInitialization()) passed++;

    console.log(`テスト結果: ${passed}/${total} 通過`);
    return passed === total;
}

// ページロード後にテスト実行
window.addEventListener('load', runTests);