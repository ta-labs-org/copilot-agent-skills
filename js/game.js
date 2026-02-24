// ブロック崩しゲームのメインコード

// 定数定義
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const PADDLE_SPEED = 5;
const BALL_RADIUS = 10;
const BALL_SPEED_X = 3;
const BALL_SPEED_Y = 3;
const BLOCK_ROWS = 5;
const BLOCK_COLS = 10;
const BLOCK_WIDTH = 70;
const BLOCK_HEIGHT = 20;
const BLOCK_PADDING = 5;
const BLOCK_OFFSET_X = 35;
const BLOCK_OFFSET_Y = 50;
const BLOCK_COLORS = ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0000ff'];
const SCORE_PER_BLOCK = 10;
const INITIAL_LIVES = 3;

class Paddle {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.dx = 0; // 移動方向
    }

    update(canvasWidth) {
        canvasWidth = canvasWidth || CANVAS_WIDTH;
        this.x += this.dx;
        // 画面外に出ないように制限
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;
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
        const canvasWidth = (game && game.width) ? game.width : CANVAS_WIDTH;
        const canvasHeight = (game && game.height) ? game.height : CANVAS_HEIGHT;
        if (this.x - this.radius < 0 || this.x + this.radius > canvasWidth) {
            this.dx = -this.dx;
        }
        if (this.y - this.radius < 0) {
            this.dy = -this.dy;
        }

        // パドルとの当たり判定（角度変更追加）
        if (paddle && this.y + this.radius > paddle.y && this.y - this.radius < paddle.y + paddle.height &&
            this.x > paddle.x && this.x < paddle.x + paddle.width) {
            // パドルの位置に基づいて角度変更
            const hitPos = (this.x - paddle.x) / paddle.width; // 0-1
            this.dx = Math.max(-3, Math.min(3, (hitPos - 0.5) * 10)); // -3 to 3
            this.dy = -Math.abs(this.dy); // 必ず上向き
        }

        // ブロックとの当たり判定（辺判定改善、角当たり両軸反転、侵入補正）
        blocks.forEach(block => {
            if (!block.destroyed &&
                this.x + this.radius > block.x && this.x - this.radius < block.x + block.width &&
                this.y + this.radius > block.y && this.y - this.radius < block.y + block.height) {
                block.destroyed = true;
                // 辺判定: ボールの中心とブロックの辺の距離でdx/dy反転
                const ballCenterX = this.x;
                const ballCenterY = this.y;
                const blockLeft = block.x;
                const blockRight = block.x + block.width;
                const blockTop = block.y;
                const blockBottom = block.y + block.height;
                const distLeft = Math.abs(ballCenterX - blockLeft);
                const distRight = Math.abs(ballCenterX - blockRight);
                const distTop = Math.abs(ballCenterY - blockTop);
                const distBottom = Math.abs(ballCenterY - blockBottom);
                const minDist = Math.min(distLeft, distRight, distTop, distBottom);
                let reverseX = false;
                let reverseY = false;
                if (minDist === distLeft || minDist === distRight) {
                    reverseX = true;
                }
                if (minDist === distTop || minDist === distBottom) {
                    reverseY = true;
                }
                // 角当たり時は両軸反転
                if (reverseX && reverseY) {
                    this.dx = -this.dx;
                    this.dy = -this.dy;
                } else if (reverseX) {
                    this.dx = -this.dx;
                } else if (reverseY) {
                    this.dy = -this.dy;
                }
                // 侵入補正: ボールがブロック内に入ったら外に出す
                const overlapX = Math.max(0, this.radius - distLeft, this.radius - distRight);
                const overlapY = Math.max(0, this.radius - distTop, this.radius - distBottom);
                if (overlapX > 0 && overlapY > 0) {
                    // 角侵入の場合、両方向補正
                    if (ballCenterX < blockLeft) this.x -= overlapX;
                    else if (ballCenterX > blockRight) this.x += overlapX;
                    if (ballCenterY < blockTop) this.y -= overlapY;
                    else if (ballCenterY > blockBottom) this.y += overlapY;
                } else if (overlapX > 0) {
                    if (ballCenterX < blockLeft) this.x -= overlapX;
                    else this.x += overlapX;
                } else if (overlapY > 0) {
                    if (ballCenterY < blockTop) this.y -= overlapY;
                    else this.y += overlapY;
                }
                if (game && typeof game.onBlockDestroyed === 'function') {
                    game.onBlockDestroyed(block);
                } else if (game) {
                    game.score += SCORE_PER_BLOCK;
                }
            }
        });

        // 下に落ちたらゲームに委譲
        if (this.y > canvasHeight) {
            if (game && typeof game.onBallLost === 'function') {
                game.onBallLost(this);
            }
        }
    }

    reset() {
        this.x = CANVAS_WIDTH / 2;
        this.y = CANVAS_HEIGHT / 2;
        // 速度を保持（方向はリセット）
        this.dx = Math.abs(this.dx);
        this.dy = Math.abs(this.dy);
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
    constructor(providers, config) {
        this.providers = providers || {};
        this.providers.rng = this.providers.rng || Math.random;
        this.providers.timer = this.providers.timer || { setTimeout: setTimeout, clearTimeout: clearTimeout };
        this.providers.logger = this.providers.logger || { info: function(){} };
        this.config = Object.assign({ dropProbability: 0.1 }, config || {});

        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        // Canvasのサイズを設定
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.isRunning = false;
        this.paddle = new Paddle(350, 550, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_SPEED);
        this.ball = new Ball(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, BALL_RADIUS, BALL_SPEED_X, BALL_SPEED_Y);
        // support multiple balls
        this.balls = [this.ball];
        this.blocks = this.createBlocks();
        // powerups
        try {
            const PowerupsManager = (typeof require === 'function') ? require('./powerups') : window.PowerupsManager;
            this.powerups = new PowerupsManager(this.providers, { dropProbability: this.config.dropProbability });
        } catch (e) {
            this.powerups = null;
        }
        this.score = 0;
        this.lives = INITIAL_LIVES;
        this.level = 1;
        this.keys = {};
        this.initEventListeners();
    }

    createBlocks() {
        const blocks = [];
        for (let r = 0; r < BLOCK_ROWS; r++) {
            for (let c = 0; c < BLOCK_COLS; c++) {
                const x = c * (BLOCK_WIDTH + BLOCK_PADDING) + BLOCK_OFFSET_X;
                const y = r * (BLOCK_HEIGHT + BLOCK_PADDING) + BLOCK_OFFSET_Y;
                const color = BLOCK_COLORS[r % BLOCK_COLORS.length];
                blocks.push(new Block(x, y, BLOCK_WIDTH, BLOCK_HEIGHT, color));
            }
        }
        return blocks;
    }

    initEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePause();
            }
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    togglePause() {
        this.isRunning = !this.isRunning;
        if (this.isRunning) {
            this.gameLoop();
        }
    }

    resizeCanvas() {
        const container = document.getElementById('game-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        // ブロック状態を保持
        const blockStates = this.blocks.map(block => block.destroyed);
        // 位置調整（簡易）
        this.paddle.y = this.height - 50;
        this.blocks = this.createBlocks();
        // 状態復元
        this.blocks.forEach((block, index) => {
            block.destroyed = blockStates[index] || false;
        });
        this.ball.reset();
    }

    start() {
        this.isRunning = true;
        this.gameLoop();
    }

    stop() {
        this.isRunning = false;
    }

    gameOver() {
        this.stop();
        document.getElementById('message').textContent = `ゲームオーバー！スコア: ${this.score}`;
    }

    gameLoop() {
        if (!this.isRunning) return;

        try {
            this.update();
            this.render();
            this.updateUI();
        } catch (error) {
            console.error('ゲームループでエラーが発生しました:', error);
            this.stop();
            document.getElementById('message').textContent = 'エラーが発生しました。ゲームを停止します。';
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // パドルの移動
        this.paddle.dx = 0;
        if (this.keys['ArrowLeft']) this.paddle.dx = -this.paddle.speed;
        if (this.keys['ArrowRight']) this.paddle.dx = this.paddle.speed;
        this.paddle.update(this.width);

        // ボールの移動（複数対応）
        this.balls.forEach(b => b.update(this.paddle, this.blocks, this));

        // powerups 更新
        if (this.powerups) this.powerups.update(this);

        // レベルクリア判定
        if (this.blocks.every(block => block.destroyed)) {
            this.nextLevel();
        }
    }

    nextLevel() {
        this.level++;
        this.blocks = this.createBlocks();
        // speed up existing balls slightly
        this.balls.forEach(b => { b.dx += 0.5; b.dy += 0.5; b.reset(); });
    }

    render() {
        // Canvasをクリア
        this.ctx.clearRect(0, 0, this.width, this.height);
        // パドルを描画
        this.paddle.render(this.ctx);
        // ボールを描画
        this.balls.forEach(b => b.render(this.ctx));
        // ブロックを描画
        this.blocks.forEach(block => block.render(this.ctx));
        // powerups を描画（存在する場合）
        if (this.powerups && this.powerups.active && this.powerups.active.length) {
            this.ctx.save();
            this.powerups.active.forEach(pu => {
                this.ctx.fillStyle = pu.type === 'multiball' ? '#FFD700' :
                                     pu.type === 'speed' ? '#FF6B6B' :
                                     pu.type === 'expand' ? '#6BCB77' : '#8E44AD';
                this.ctx.fillRect(pu.x, pu.y, pu.width, pu.height);
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '12px sans-serif';
                const label = pu.type === 'multiball' ? 'M' : pu.type === 'speed' ? 'S' : pu.type === 'expand' ? 'E' : 'P';
                this.ctx.fillText(label, pu.x + 6, pu.y + 16);
            });
            this.ctx.restore();
        }
    }

    updateUI() {
        document.getElementById('score').textContent = `スコア: ${this.score}`;
        document.getElementById('lives').textContent = `ライフ: ${this.lives}`;
    }

    onBlockDestroyed(block) {
        this.score += SCORE_PER_BLOCK;
        // spawn powerup at block center
        if (this.powerups) {
            const bx = block.x + block.width / 2 - 12;
            const by = block.y + block.height / 2 - 12;
            this.powerups.spawn(bx, by);
        }
    }

    onBallLost(ball) {
        // remove this ball from active balls
        const idx = this.balls.indexOf(ball);
        if (idx !== -1) this.balls.splice(idx, 1);
        // if none left, lose a life and reset main ball
        if (this.balls.length === 0) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                // reset main ball and add back
                this.ball.reset();
                this.balls = [this.ball];
            }
        }
    }

    spawnExtraBall() {
        // duplicate main ball with mirrored velocities
        const b = new Ball(this.ball.x, this.ball.y, this.ball.radius, -this.ball.dx || BALL_SPEED_X, -this.ball.dy || BALL_SPEED_Y);
        this.balls.push(b);
    }
}

// ゲームインスタンス作成
const game = new Game();

// ページロード後にゲーム開始（テスト用）
window.addEventListener('load', () => {
    game.start();
});