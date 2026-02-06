// ブロック崩しゲームのメインコード

class Paddle {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.dx = 0; // 移動方向
    }

    update() {
        this.x += this.dx;
        // 画面外に出ないように制限
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > 800) this.x = 800 - this.width;
    }

    render(ctx) {
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.isRunning = false;
        this.paddle = new Paddle(350, 550, 100, 20, 5);
        this.keys = {};
        this.initEventListeners();
    }

    initEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
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
        // パドルの移動
        this.paddle.dx = 0;
        if (this.keys['ArrowLeft']) this.paddle.dx = -this.paddle.speed;
        if (this.keys['ArrowRight']) this.paddle.dx = this.paddle.speed;
        this.paddle.update();
    }

    render() {
        // Canvasをクリア
        this.ctx.clearRect(0, 0, this.width, this.height);
        // パドルを描画
        this.paddle.render(this.ctx);
    }
}

// ゲームインスタンス作成
const game = new Game();

// ページロード後にゲーム開始（テスト用）
window.addEventListener('load', () => {
    game.start();
});