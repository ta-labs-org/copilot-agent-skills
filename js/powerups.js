// Powerups manager (UMD-style for browser and Node)
(function(global) {
    function defaultRng() { return Math.random(); }
    function noop() {}

    function PowerupsManager(providers, config) {
        this.providers = providers || {};
        this.providers.rng = (this.providers.rng || defaultRng);
        this.providers.timer = (this.providers.timer || { setTimeout: setTimeout, clearTimeout: clearTimeout });
        this.providers.logger = (this.providers.logger || { info: noop });
        this.config = Object.assign({ dropProbability: 0.1 }, config || {});

        this.active = [];
        this.effects = new Map(); // effectId -> {type, timerId, meta}
        this._nextId = 1;
    }

    PowerupsManager.prototype.spawn = function(x, y) {
        // Decide whether to drop
        if (this.providers.rng() >= this.config.dropProbability) return null;
        const types = ['speed', 'multiball', 'expand', 'pistol'];
        const type = types[Math.floor(this.providers.rng() * types.length)];
        const id = this._nextId++;
        const pu = { id, type, x: x || 0, y: y || 0, vy: 2, width: 24, height: 24 };
        this.active.push(pu);
        this.providers.logger.info && this.providers.logger.info('spawned powerup', pu);
        return pu;
    };

    PowerupsManager.prototype.update = function(game) {
        // move down
        const toRemove = [];
        this.active.forEach(pu => {
            pu.y += pu.vy;
            // if off screen
            if (pu.y > (game && game.height || 600)) {
                toRemove.push(pu.id);
            } else if (game && this._checkPaddleCollision(pu, game.paddle)) {
                // collect
                this.apply(pu.type, game, pu);
                toRemove.push(pu.id);
            }
        });
        if (toRemove.length) this.active = this.active.filter(p => toRemove.indexOf(p.id) === -1);
    };

    PowerupsManager.prototype._checkPaddleCollision = function(pu, paddle) {
        if (!paddle) return false;
        return pu.x + pu.width > paddle.x && pu.x < paddle.x + paddle.width && pu.y + pu.height > paddle.y && pu.y < paddle.y + paddle.height;
    };

    PowerupsManager.prototype.apply = function(type, game, pu) {
        const id = pu && pu.id || this._nextId++;
        const logger = this.providers.logger;
        logger && logger.info && logger.info('apply powerup', type);

        if (type === 'multiball') {
            // immediate effect
            if (game && typeof game.spawnExtraBall === 'function') {
                game.spawnExtraBall();
            }
            return;
        }

        const effectDurations = { speed: 10000, expand: 10000, pistol: 8000 };
        const duration = effectDurations[type] || 0;

        // apply immediate change
        const meta = {};
        if (type === 'speed') {
            meta.orig = game.paddle.speed;
            game.paddle.speed = (game.paddle.speed || 5) * 1.7;
        } else if (type === 'expand') {
            meta.orig = game.paddle.width;
            game.paddle.width = Math.floor((game.paddle.width || 100) * 1.5);
        } else if (type === 'pistol') {
            meta.orig = false;
            game.paddle.pistol = true;
        }

        // schedule removal
        const timerId = this.providers.timer.setTimeout(() => {
            this.remove(id, game);
        }, duration);

        this.effects.set(id, { id, type, timerId, meta });
    };

    PowerupsManager.prototype.remove = function(id, game) {
        const entry = this.effects.get(id);
        if (!entry) return;
        const { type, timerId, meta } = entry;
        this.providers.timer.clearTimeout && this.providers.timer.clearTimeout(timerId);
        if (type === 'speed') {
            if (meta && typeof meta.orig !== 'undefined') game.paddle.speed = meta.orig;
        } else if (type === 'expand') {
            if (meta && typeof meta.orig !== 'undefined') game.paddle.width = meta.orig;
        } else if (type === 'pistol') {
            game.paddle.pistol = false;
        }
        this.effects.delete(id);
        this.providers.logger && this.providers.logger.info && this.providers.logger.info('removed powerup', type, id);
    };

    // Expose
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = PowerupsManager;
    } else {
        global.PowerupsManager = PowerupsManager;
    }

})(typeof window !== 'undefined' ? window : global);
