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

    update(paddle, blocks, game) {
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

        // ブロックとの当たり判定
        blocks.forEach(block => {
            if (!block.destroyed &&
                this.x + this.radius > block.x && this.x - this.radius < block.x + block.width &&
                this.y + this.radius > block.y && this.y - this.radius < block.y + block.height) {
                block.destroyed = true;
                this.dy = -this.dy;
                game.score += 10;
            }
        });

        // 下に落ちたらリセット（ライフ減らす）
        if (this.y > 600) {
            game.lives--;
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

class Block {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.destroyed = false;
    }

    render(ctx) {
        if (!this.destroyed) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
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
        this.blocks = this.createBlocks();
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.keys = {};
        this.initEventListeners();
    }

    createBlocks() {
        const blocks = [];
        const rows = 5;
        const cols = 10;
        const blockWidth = 70;
        const blockHeight = 20;
        const padding = 5;
        const offsetX = 35;
        const offsetY = 50;
        const colors = ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0000ff'];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = c * (blockWidth + padding) + offsetX;
                const y = r * (blockHeight + padding) + offsetY;
                const color = colors[r % colors.length];
                blocks.push(new Block(x, y, blockWidth, blockHeight, color));
            }
        }
        return blocks;
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
        this.updateUI();

        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // パドルの移動
        this.paddle.dx = 0;
        if (this.keys['ArrowLeft']) this.paddle.dx = -this.paddle.speed;
        if (this.keys['ArrowRight']) this.paddle.dx = this.paddle.speed;
        this.paddle.update();

        // ボールの移動
        this.ball.update(this.paddle, this.blocks, this);

        // レベルクリア判定
        if (this.blocks.every(block => block.destroyed)) {
            this.nextLevel();
        }
    }

    nextLevel() {
        this.level++;
        this.blocks = this.createBlocks();
        this.ball.dx += 0.5;
        this.ball.dy += 0.5;
        this.ball.reset();
    }

    render() {
        // Canvasをクリア
        this.ctx.clearRect(0, 0, this.width, this.height);
        // パドルを描画
        this.paddle.render(this.ctx);
        // ボールを描画
        this.ball.render(this.ctx);
        // ブロックを描画
        this.blocks.forEach(block => block.render(this.ctx));
    }

    updateUI() {
        document.getElementById('score').textContent = `スコア: ${this.score}`;
        document.getElementById('lives').textContent = `ライフ: ${this.lives}`;
    }
}

// ゲームインスタンス作成
const game = new Game();

// ページロード後にゲーム開始（テスト用）
window.addEventListener('load', () => {
    game.start();
});