// ブロック崩しゲームのメインコード

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.isRunning = false;
    }

    start() {
        this.isRunning = true;
        this.gameLoop();
    }

    stop() {
        this.isRunning = false;
    }

    gameLoop() {
        if (!this.isRunning) return;

        this.update();
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // 更新処理（後で実装）
    }

    render() {
        // Canvasをクリア
        this.ctx.clearRect(0, 0, this.width, this.height);
        // レンダリング処理（後で実装）
    }
}

// ゲームインスタンス作成
const game = new Game();

// ページロード後にゲーム開始（テスト用）
window.addEventListener('load', () => {
    game.start();
});