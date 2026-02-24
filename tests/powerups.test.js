const PowerupsManager = require('../js/powerups');

describe('PowerupsManager', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    afterEach(() => {
        jest.useRealTimers();
    });

    test('apply and remove speed effect', () => {
        const providers = { rng: () => 0.01, timer: { setTimeout: setTimeout, clearTimeout: clearTimeout }, logger: { info: () => {} } };
        const mgr = new PowerupsManager(providers, { dropProbability: 0.1 });
        const game = { paddle: { speed: 5, width: 100, pistol: false } };

        mgr.apply('speed', game, { id: 1 });
        expect(game.paddle.speed).toBeGreaterThan(5);

        // advance time to expire
        jest.advanceTimersByTime(10000);
        expect(game.paddle.speed).toBe(5);
    });

    test('apply and remove expand effect', () => {
        const providers = { rng: () => 0.01, timer: { setTimeout: setTimeout, clearTimeout: clearTimeout }, logger: { info: () => {} } };
        const mgr = new PowerupsManager(providers, { dropProbability: 0.1 });
        const game = { paddle: { speed: 5, width: 100, pistol: false } };

        mgr.apply('expand', game, { id: 2 });
        expect(game.paddle.width).toBeGreaterThan(100);

        jest.advanceTimersByTime(10000);
        expect(game.paddle.width).toBe(100);
    });

    test('apply and remove pistol effect', () => {
        const providers = { rng: () => 0.01, timer: { setTimeout: setTimeout, clearTimeout: clearTimeout }, logger: { info: () => {} } };
        const mgr = new PowerupsManager(providers, { dropProbability: 0.1 });
        const game = { paddle: { speed: 5, width: 100, pistol: false } };

        mgr.apply('pistol', game, { id: 3 });
        expect(game.paddle.pistol).toBe(true);

        jest.advanceTimersByTime(8000);
        expect(game.paddle.pistol).toBe(false);
    });

    test('multiball calls spawnExtraBall immediately', () => {
        const providers = { rng: () => 0.01, timer: { setTimeout: setTimeout, clearTimeout: clearTimeout }, logger: { info: () => {} } };
        const mgr = new PowerupsManager(providers, { dropProbability: 0.1 });
        let spawned = 0;
        const game = { spawnExtraBall: () => { spawned++; } };

        mgr.apply('multiball', game, { id: 4 });
        expect(spawned).toBe(1);
    });
});
