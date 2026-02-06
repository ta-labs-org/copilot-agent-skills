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

// テスト実行
function runTests() {
    console.log('テストを開始します...');
    let passed = 0;
    let total = 2;

    if (testCanvasElement()) passed++;
    if (testGameInitialization()) passed++;

    console.log(`テスト結果: ${passed}/${total} 通過`);
    return passed === total;
}

// ページロード後にテスト実行
window.addEventListener('load', runTests);