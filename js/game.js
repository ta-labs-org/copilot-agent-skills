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

class Ball {
    constructor(x, y, radius, dx, dy) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
    }

    update(paddle) {
        this.x += this.dx;
        this.y += this.dy;

        // 壁反射
        if (this.x - this.radius < 0 || this.x + this.radius > 800) {
            this.dx = -this.dx;
        }
        if (this.y - this.radius < 0) {
            this.dy = -this.dy;
        }

        // パドルとの当たり判定
        if (this.y + this.radius > paddle.y && this.y - this.radius < paddle.y + paddle.height &&
            this.x > paddle.x && this.x < paddle.x + paddle.width) {
            this.dy = -this.dy;
        }

        // 下に落ちたらリセット（後でライフ減らす）
        if (this.y > 600) {
            this.reset();
        }
    }

    reset() {
        this.x = 400;
        this.y = 300;
        this.dx = 3;
        this.dy = 3;
    }

    render(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f00';
        ctx.fill();
        ctx.closePath();
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
        this.ball = new Ball(400, 300, 10, 3, 3);
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

        // ボールの移動
        this.ball.update(this.paddle);
    }

    render() {
        // Canvasをクリア
        this.ctx.clearRect(0, 0, this.width, this.height);
        // パドルを描画
        this.paddle.render(this.ctx);
        // ボールを描画
        this.ball.render(this.ctx);
    }
}

// ゲームインスタンス作成
const game = new Game();

// ページロード後にゲーム開始（テスト用）
window.addEventListener('load', () => {
    game.start();
});