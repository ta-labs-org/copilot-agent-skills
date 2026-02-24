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
        // safe logger call
        try { if (this.providers.logger && typeof this.providers.logger.info === 'function') this.providers.logger.info.apply(this.providers.logger, ['spawned powerup', pu]); } catch (e) { /* ignore logging errors */ }
        return pu;
    };

    PowerupsManager.prototype.update = function(game) {
        // move down
        const toRemove = [];
        const collected = [];
        this.active.forEach(pu => {
            pu.y += pu.vy;
            // if off screen
            if (pu.y > (game && game.height || 600)) {
                toRemove.push(pu.id);
            } else if (game && this._checkPaddleCollision(pu, game.paddle)) {
                // collect for after-iteration apply
                collected.push(pu);
                toRemove.push(pu.id);
            }
        });

        // remove collected/off-screen
        if (toRemove.length) this.active = this.active.filter(p => toRemove.indexOf(p.id) === -1);

        // apply collected effects after iteration (avoid mutating active during iteration)
        collected.forEach(pu => {
            try {
                this.apply(pu.type, game, pu);
            } catch (err) {
                try { if (this.providers && this.providers.logger && typeof this.providers.logger.info === 'function') this.providers.logger.info.call(this.providers.logger, 'powerup apply error', err); } catch(e) {}
            }
        });
    };

    PowerupsManager.prototype._checkPaddleCollision = function(pu, paddle) {
        if (!paddle) return false;
        return pu.x + pu.width > paddle.x && pu.x < paddle.x + paddle.width && pu.y + pu.height > paddle.y && pu.y < paddle.y + paddle.height;
    };

    PowerupsManager.prototype.apply = function(type, game, pu) {
        const id = pu && pu.id || this._nextId++;
        const logger = this.providers.logger;
        try { if (logger && typeof logger.info === 'function') logger.info.apply(logger, ['apply powerup', type]); } catch (e) {}

        if (type === 'multiball') {
            // immediate effect
            if (game && typeof game.spawnExtraBall === 'function') {
                game.spawnExtraBall();
            }
            // remove the pu from active immediately if passed
            if (pu && this.active) this.active = this.active.filter(p => p.id !== pu.id);
            return;
        }

        const effectDurations = { speed: 10000, expand: 10000, pistol: 8000 };
        const duration = effectDurations[type] || 0;

        // If an effect of this type already exists, extend its timer instead of stacking
        for (let [eid, entry] of this.effects.entries()) {
            if (entry.type === type) {
                // clear previous timer and schedule a new one
                // clear previous timer safely
                try {
                    if (this.providers.timer && typeof this.providers.timer.clearTimeout === 'function') this.providers.timer.clearTimeout.call(globalThis, entry.timerId);
                } catch (e) { }
                // schedule new timer safely
                let newTimerId;
                try {
                    if (this.providers.timer && typeof this.providers.timer.setTimeout === 'function') newTimerId = this.providers.timer.setTimeout.call(globalThis, () => this.remove(eid, game), duration);
                } catch (e) { }
                entry.timerId = newTimerId;
                try { if (logger && typeof logger.info === 'function') logger.info.apply(logger, ['extended effect', type, eid]); } catch (e) {}
                // remove collected pu
                if (pu && this.active) this.active = this.active.filter(p => p.id !== pu.id);
                return;
            }
        }

        // apply immediate change
        const meta = {};
        if (type === 'speed') {
            meta.orig = (game && game.paddle && typeof game.paddle.speed === 'number') ? game.paddle.speed : undefined;
            game.paddle && (game.paddle.speed = (game.paddle.speed || 5) * 1.7);
        } else if (type === 'expand') {
            meta.orig = (game && game.paddle && typeof game.paddle.width === 'number') ? game.paddle.width : undefined;
            game.paddle && (game.paddle.width = Math.floor((game.paddle.width || 100) * 1.5));
        } else if (type === 'pistol') {
            meta.orig = false;
            game.paddle && (game.paddle.pistol = true);
        }

        // remove the collected powerup from active list to avoid re-collision
        if (pu && this.active) this.active = this.active.filter(p => p.id !== pu.id);

        // schedule removal
        let timerId;
        try {
            if (this.providers.timer && typeof this.providers.timer.setTimeout === 'function') {
                timerId = this.providers.timer.setTimeout.call(globalThis, () => { this.remove(id, game); }, duration);
            }
        } catch (e) { }

        this.effects.set(id, { id, type, timerId, meta });
    };

    PowerupsManager.prototype.remove = function(id, game) {
        const entry = this.effects.get(id);
        if (!entry) return;
        const { type, timerId, meta } = entry;
        try { if (this.providers.timer && typeof this.providers.timer.clearTimeout === 'function') this.providers.timer.clearTimeout.call(globalThis, timerId); } catch (e) {}
        if (type === 'speed') {
            if (meta && typeof meta.orig !== 'undefined') game.paddle.speed = meta.orig;
        } else if (type === 'expand') {
            if (meta && typeof meta.orig !== 'undefined') game.paddle.width = meta.orig;
        } else if (type === 'pistol') {
            game.paddle.pistol = false;
        }
        this.effects.delete(id);
        try { if (this.providers.logger && typeof this.providers.logger.info === 'function') this.providers.logger.info.apply(this.providers.logger, ['removed powerup', type, id]); } catch (e) {}
    };

    // Expose
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = PowerupsManager;
    } else {
        global.PowerupsManager = PowerupsManager;
    }

})(typeof window !== 'undefined' ? window : global);
