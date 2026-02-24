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

// テスト5: ブロッククラスの初期化
function testBlockInitialization() {
    if (typeof Block !== 'undefined') {
        console.log('✓ Blockクラスが定義されています');
        return true;
    } else {
        console.log('✗ Blockクラスが定義されていません');
        return false;
    }
}

// テスト6: ボールの移動テスト
function testBallMovement() {
    const ball = new Ball(400, 300, 10, 3, 3);
    const initialX = ball.x;
    const initialY = ball.y;
    ball.update(null, [], { score: 0, lives: 3 }); // パドルとブロックなしで更新
    if (ball.x === initialX + 3 && ball.y === initialY + 3) {
        console.log('✓ ボールの移動が正しく動作します');
        return true;
    } else {
        console.log('✗ ボールの移動が正しく動作しません');
        return false;
    }
}

// テスト7: ボールとパドルの衝突テスト
function testBallPaddleCollision() {
    const paddle = new Paddle(350, 550, 100, 20, 5);
    const ball = new Ball(400, 545, 10, 3, 3); // パドルに近い位置
    const initialDy = ball.dy;
    ball.update(paddle, [], { score: 0, lives: 3 });
    if (ball.dy === -initialDy) {
        console.log('✓ ボールとパドルの衝突が正しく動作します');
        return true;
    } else {
        console.log('✗ ボールとパドルの衝突が正しく動作しません');
        return false;
    }
}

// テスト8: ボールとブロックの衝突テスト
function testBallBlockCollision() {
    const block = new Block(400, 300, 70, 20, '#ff0000');
    const ball = new Ball(400, 300, 10, 3, 3);
    const game = { score: 0, lives: 3 };
    const initialDy = ball.dy;
    ball.update(null, [block], game);
    if (block.destroyed && ball.dy === -initialDy && game.score === 10) {
        console.log('✓ ボールとブロックの衝突が正しく動作します');
        return true;
    } else {
        console.log('✗ ボールとブロックの衝突が正しく動作しません');
        return false;
    }
}

// テスト9: 角当たり時の両軸反転テスト
function testCornerCollision() {
    const block = new Block(400, 300, 70, 20, '#ff0000');
    const ball = new Ball(435, 320, 10, 3, 3); // 右下角に近い
    const game = { score: 0, lives: 3 };
    const initialDx = ball.dx;
    const initialDy = ball.dy;
    ball.update(null, [block], game);
    if (block.destroyed && ball.dx === -initialDx && ball.dy === -initialDy) {
        console.log('✓ 角当たり時の両軸反転が正しく動作します');
        return true;
    } else {
        console.log('✗ 角当たり時の両軸反転が正しく動作しません');
        return false;
    }
}

// テスト10: ボール侵入補正テスト
function testBallPenetrationCorrection() {
    const block = new Block(400, 300, 70, 20, '#ff0000');
    const ball = new Ball(400, 310, 10, 0, 0); // ブロック内に侵入
    const game = { score: 0, lives: 3 };
    ball.update(null, [block], game);
    // 補正後、ボールがブロック外に出るはず
    if (block.destroyed && ball.y <= 320) { // 仮定の補正
        console.log('✓ ボール侵入補正が正しく動作します');
        return true;
    } else {
        console.log('✗ ボール侵入補正が正しく動作しません');
        return false;
    }
}

// テスト11: ゲームオーバーテスト
function testGameOver() {
    const game = new Game();
    game.lives = 1;
    game.ball.y = 601; // 下に落ちる
    game.ball.update(game.paddle, [], game);
    if (game.lives === 0 && !game.isRunning) {
        console.log('✓ ゲームオーバーが正しく動作します');
        return true;
    } else {
        console.log('✗ ゲームオーバーが正しく動作しません');
        return false;
    }
}

// テスト12: レベル遷移テスト
function testLevelTransition() {
    const game = new Game();
    game.blocks.forEach(block => block.destroyed = true);
    game.update();
    if (game.level === 2) {
        console.log('✓ レベル遷移が正しく動作します');
        return true;
    } else {
        console.log('✗ レベル遷移が正しく動作しません');
        return false;
    }
}

// テスト13: リサイズ時のブロック状態保持テスト
function testResizeBlockState() {
    const game = new Game();
    game.blocks[0].destroyed = true; // 最初のブロックを破壊
    game.resizeCanvas();
    if (game.blocks[0].destroyed) { // 保持されているはず
        console.log('✓ リサイズ時のブロック状態保持が正しく動作します');
        return true;
    } else {
        console.log('✗ リサイズ時のブロック状態保持が正しく動作しません');
        return false;
    }
}

// テスト14: ボールリセット時の速度保持テスト
function testBallResetSpeed() {
    const ball = new Ball(400, 300, 10, 5, 4);
    ball.reset();
    if (ball.dx === 5 && ball.dy === 4) {
        console.log('✓ ボールリセット時の速度保持が正しく動作します');
        return true;
    } else {
        console.log('✗ ボールリセット時の速度保持が正しく動作しません');
        return false;
    }
}

// テスト15: dx変更範囲制限テスト
function testDxRangeLimit() {
    const paddle = new Paddle(350, 550, 100, 20, 5);
    const ball = new Ball(400, 545, 10, 3, 3);
    ball.update(paddle, [], { score: 0, lives: 3 });
    if (ball.dx >= -3 && ball.dx <= 3) {
        console.log('✓ dx変更範囲制限が正しく動作します');
        return true;
    } else {
        console.log('✗ dx変更範囲制限が正しく動作しません');
        return false;
    }
}

// テスト実行
function runTests() {
    console.log('テストを開始します...');
    let passed = 0;
    let total = 15;

    if (testCanvasElement()) passed++;
    if (testGameInitialization()) passed++;
    if (testPaddleInitialization()) passed++;
    if (testBallInitialization()) passed++;
    if (testBlockInitialization()) passed++;
    if (testBallMovement()) passed++;
    if (testBallPaddleCollision()) passed++;
    if (testBallBlockCollision()) passed++;
    if (testCornerCollision()) passed++;
    if (testBallPenetrationCorrection()) passed++;
    if (testGameOver()) passed++;
    if (testLevelTransition()) passed++;
    if (testResizeBlockState()) passed++;
    if (testBallResetSpeed()) passed++;
    if (testDxRangeLimit()) passed++;

    console.log(`テスト結果: ${passed}/${total} 通過`);
    return passed === total;
}

// ページロード後にテスト実行
window.addEventListener('load', runTests);