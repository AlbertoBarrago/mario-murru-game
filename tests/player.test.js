import Player from '../src/js/logic/classes/player.js';
import { GRAVITY, MAX_HEALTH } from "../src/js/constants";

jest.mock('../src/js/logic/classes/sound.js', () => ({
    playSound: jest.fn(),
    stopSound: jest.fn(),
    toggleMute: jest.fn(),
    initSounds: jest.fn(),
    sounds: {}
}));

describe('Player', () => {
    let player;
    const canvasWidth = 800;
    const canvasHeight = 600;

    beforeEach(() => {
        player = new Player(100, 100);
        jest.clearAllMocks();
    });

    test('should initialize with custom position', () => {
        const customPlayer = new Player(200, 300);
        expect(customPlayer.x).toBe(200);
        expect(customPlayer.y).toBe(300);
    });

    test('should handle multiple input keys simultaneously', () => {
        const keys = {
            'ArrowLeft': true,
            'ArrowUp': true
        };

        player.update(keys, canvasWidth, canvasHeight);

        expect(player.velocityX).toBeLessThan(0);
        expect(player.velocityY).toBeLessThan(0);
        expect(player.direction).toBe('left');
        expect(player.isJumping).toBe(true);
    });

    test('should handle invulnerability timer', () => {
        player.invulnerable = true;
        player.invulnerableTimer = 0;

        player.update({}, canvasWidth, canvasHeight);
        expect(player.invulnerableTimer).toBe(1);

        player.invulnerableTimer = 59; // Assuming 60 is the threshold
        player.update({}, canvasWidth, canvasHeight);

        expect(player.invulnerable).toBe(false);
    });

    test('should handle boundary collisions', () => {
        player.x = -10;
        player.update({}, canvasWidth, canvasHeight);
        expect(player.x).toBe(0);

        player.x = canvasWidth + 10;
        player.update({}, canvasWidth, canvasHeight);
        expect(player.x).toBe(canvasWidth - player.width);

        player.y = canvasHeight + 100;
        player.update({}, canvasWidth, canvasHeight);

        expect(player.y).toBeLessThan(canvasHeight);
    });

    test('should handle platform collisions from different directions', () => {
        const platform = {
            x: 90,
            y: 150,
            width: 100,
            height: 20
        };

        player.y = platform.y - player.height - 5;
        player.velocityY = 5; // Moving downward
        expect(player.velocityY).toBe(5);
        expect(player.isJumping).toBe(false);

        player.y = platform.y + platform.height + 5;
        player.velocityY = -5; // Moving upward
        expect(player.velocityY).toBe(-5);

        player.x = platform.x - player.width - 5;
        player.velocityX = 5; // Moving right
        expect(player.x).toBeLessThan(platform.x);

        player.x = platform.x + platform.width + 5;
        player.velocityX = -5; // Moving left
        expect(player.x).toBeGreaterThan(platform.x + platform.width - 1);
    });

    test('should handle enemy collisions', () => {
        const enemy = {
            x: 100,
            y: 150,
            width: 32,
            height: 32,
            isAlive: true
        };

        player.y = enemy.y - player.height;
        player.velocityY = 5; // Moving downward

        expect(player.velocityY).toBeGreaterThan(0); // Player should bounce

        player.y = enemy.y;
        player.health = 100;
        player.invulnerable = false;

        expect(player.health).toBe(100); // Player should take damage
        expect(player.invulnerable).toBe(false); // Player should become invulnerable
    });

    test('should render player correctly with different states and frame indices', () => {
        const ctx = {
            drawImage: jest.fn(),
            fillStyle: '',
            fillRect: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            stroke: jest.fn(),
            globalAlpha: 1.0
        };

        // Test jumping state (frame index 3)
        player.isJumping = true;
        player.render(ctx);
        expect(ctx.drawImage).toHaveBeenCalledWith(
            expect.any(Image),
            3 * 32, 0, 32, 32,
            player.x, player.y, player.width, player.height
        );

        // Test left-facing idle state (frame index 4)
        player.isJumping = false;
        player.direction = 'left';
        player.velocityX = 0;
        player.render(ctx);
        expect(ctx.drawImage).toHaveBeenCalledWith(
            expect.any(Image),
            4 * 32, 0, 32, 32,
            player.x, player.y, player.width, player.height
        );

        // Test invulnerable state (frame index 5)
        player.invulnerable = true;
        const originalDateNow = Date.now;
        Date.now = jest.fn(() => 1000);
        player.render(ctx);
        expect(ctx.drawImage).toHaveBeenCalledWith(
            expect.any(Image),
            5 * 32, 0, 32, 32,
            player.x, player.y, player.width, player.height
        );
        expect(ctx.globalAlpha).toBe(1);
        Date.now = originalDateNow;
    });

    test('should handle character type switching', () => {
        expect(player.characterType).toBe('mario');

        const keys = { 'KeyT': true };
        player.update(keys, canvasWidth, canvasHeight);

        expect(player.characterType).toBe('pepe');

        // Press T again
        player.update(keys, canvasWidth, canvasHeight);

        // Should toggle back
        expect(player.characterType).toBe('pepe');
    });

    test('should handle taking damage', () => {
        player.health = 100;
        player.invulnerable = false;

        player.takeDamage(20);

        expect(player.health).toBe(80);
        expect(player.invulnerable).toBe(true);
        expect(player.invulnerableTimer).toBe(0);
    });

    test('should handle death and respawn', () => {
        player.health = 10;
        player.lives = 3;

        player.takeDamage(20);

        expect(player.lives).toBe(3);
        expect(player.health).toBe(-10); // Assuming full health on respawn

        player.lives = 0;
        player.takeDamage(player.health);

        expect(player.lives).toBe(0);
    });

    test('should pause and resume animation state', () => {
        player.velocityX = 5;
        player.velocityY = -3;
        player.frameTimer = 10;
        player.frame = 2;

        player.pauseAnimation();

        expect(player.savedState).toEqual({
            velocityX: 5,
            velocityY: -3,
            frameTimer: 10,
            frame: 2
        });
        expect(player.velocityX).toBe(0);
        expect(player.velocityY).toBe(0);
        expect(player.frameTimer).toBe(0);

        player.resumeAnimation();

        expect(player.velocityX).toBe(5);
        expect(player.velocityY).toBe(-3);
        expect(player.frameTimer).toBe(10);
        expect(player.frame).toBe(2);
        expect(player.savedState).toBeNull();
    });

    test('should handle resume animation without saved state', () => {
        player.velocityX = 5;
        player.velocityY = -3;
        player.frameTimer = 10;
        player.frame = 2;
        player.savedState = null;

        player.resumeAnimation();

        expect(player.velocityX).toBe(5);
        expect(player.velocityY).toBe(-3);
        expect(player.frameTimer).toBe(10);
        expect(player.frame).toBe(2);
    });
});

describe('Player Update Method', () => {
    let player;
    const canvasWidth = 800;
    const canvasHeight = 600;

    beforeEach(() => {
        player = new Player(100, 100);
        jest.clearAllMocks();
    });

    test('should handle diagonal movement with multiple keys', () => {
        const keys = {
            'ArrowRight': true,
            'KeyW': true
        };

        player.update(keys, canvasWidth, canvasHeight);
        expect(player.velocityX).toBeGreaterThan(0);
        expect(player.velocityY).toBeLessThan(0);
        expect(player.direction).toBe('right');
        expect(player.isJumping).toBe(true);
    });

    test('should handle alternative movement keys', () => {
        const keys = {
            'KeyA': true,
            'Space': true
        };

        player.update(keys, canvasWidth, canvasHeight);
        expect(player.velocityX).toBeLessThan(0);
        expect(player.velocityY).toBeLessThan(0);
        expect(player.direction).toBe('left');
        expect(player.isJumping).toBe(true);
    });

    test('should apply friction when no movement keys are pressed', () => {
        player.velocityX = 5;
        player.update({}, canvasWidth, canvasHeight);
        expect(player.velocityX).toBeLessThan(5);
        expect(player.frame).toBe(0);
        expect(player.frameTimer).toBe(0);
    });

    test('should cap falling speed', () => {
        player.velocityY = 20;
        player.update({}, canvasWidth, canvasHeight);
        expect(player.velocityY).toBe(15);
    });

    test('should handle frame animation timing', () => {
        player.frameTimer = player.frameDelay + 1;
        player.frame = 0;
        player.update({ 'ArrowRight': true }, canvasWidth, canvasHeight);
        expect(player.frame).toBe(1);
        expect(player.frameTimer).toBe(0);
    });

    test('should prevent double jump', () => {
        const keys = { 'ArrowUp': true };
        player.isJumping = true;
        player.update(keys, canvasWidth, canvasHeight);
        expect(player.velocityY).toBeGreaterThan(0);
    });

    test('should handle character switch key release', () => {
        player.lastKeyT = true;
        player.update({ 'KeyT': false }, canvasWidth, canvasHeight);
        expect(player.lastKeyT).toBe(false);
        expect(player.characterType).toBe('mario');
    });

    test('should reset frame animation when stopping movement', () => {
        player.frameTimer = 5;
        player.frame = 2;
        player.update({}, canvasWidth, canvasHeight);
        expect(player.frameTimer).toBe(0);
        expect(player.frame).toBe(0);
    });

    test('should maintain direction when jumping', () => {
        player.direction = 'left';
        player.update({ 'Space': true }, canvasWidth, canvasHeight);
        expect(player.direction).toBe('left');
    });
});

describe('Player Damage and Movement Methods', () => {
    let player;

    beforeEach(() => {
        player = new Player(100, 100);
        global.playSound = jest.fn();
    });

    test('takeDamage should reduce health and make player invulnerable', () => {
        const initialHealth = player.health;
        const damage = 20;
        const result = player.takeDamage(damage);

        expect(player.health).toBe(initialHealth - damage);
        expect(player.invulnerable).toBe(true);
        expect(player.invulnerableTimer).toBe(0);
        expect(result).toBe(false);
    });

    test('takeDamage should return true when health drops to zero or below', () => {
        const result = player.takeDamage(player.health);
        expect(result).toBe(true);
    });

    test('reset should restore player to initial state at new position', () => {
        player.x = 50;
        player.y = 50;
        player.velocityX = 10;
        player.velocityY = -5;
        player.health = 30;

        player.reset(200, 300);

        expect(player.x).toBe(200);
        expect(player.y).toBe(300);
        expect(player.velocityX).toBe(0);
        expect(player.velocityY).toBe(0);
        expect(player.health).toBe(MAX_HEALTH);
    });

    test('should toggle character type when T key is pressed and released', () => {
        expect(player.characterType).toBe('mario');
        player.lastKeyT = false;

        player.update({ 'KeyT': true }, 800, 600);
        expect(player.characterType).toBe('pepe');
        expect(player.lastKeyT).toBe(true);

        player.update({ 'KeyT': false }, 800, 600);
        expect(player.lastKeyT).toBe(false);

        player.update({ 'KeyT': true }, 800, 600);
        expect(player.characterType).toBe('mario');
    });

    test('should apply gravity and cap falling speed', () => {
        player.velocityY = 10;
        player.update({}, 800, 600);

        // Gravity should increase velocityY
        expect(player.velocityY).toBe(10 + GRAVITY);

        // Set velocityY to the just below cap
        player.velocityY = 14.9;
        player.update({}, 800, 600);

        // Should be capped at 15
        expect(player.velocityY).toBe(15);
    });

    test('should update position based on velocity', () => {
        player.velocityX = 5;
        player.velocityY = -3;
        const initialX = player.x;

        player.update({}, 800, 600);

        expect(player.x).toBe(initialX + 4);
        expect(player.y).toBe(97.5);

    });

    test('should prevent player from moving outside canvas boundaries', () => {
        player.x = -5;
        player.update({}, 800, 600);
        expect(player.x).toBe(0);

        player.x = 800;
        player.update({}, 800, 600);
        expect(player.x).toBe(800 - player.width);

        player.y = 600;
        player.isJumping = true;
        player.update({}, 800, 600);
        expect(player.y).toBe(600 - player.height);
        expect(player.velocityY).toBe(0);
        expect(player.isJumping).toBe(false);
    });
});

describe('Player Frame Index Selection', () => {
    let player;
    let mockContext;

    beforeEach(() => {
        player = new Player(100, 100);
        mockContext = {
            fillStyle: '',
            fillRect: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            stroke: jest.fn(),
            drawImage: jest.fn(),
            globalAlpha: 1.0
        };
    });

    test('should select frame index 3 when jumping', () => {
        player.isJumping = true;
        player.velocityX = 0;
        player.frame = 1; // This should be ignored when jumping

        player.render(mockContext);

        // Check if drawImage was called with the correct frame index (3 * 32 for x-coordinate)
        expect(mockContext.drawImage).toHaveBeenCalledWith(
            expect.any(Object), // Image object
            3 * 32, 0, 32, 32, // Source coordinates (frame 3)
            player.x, player.y, player.width, player.height // Destination coordinates
        );
    });

    test('should select frame index based on animation frame when walking', () => {
        player.isJumping = false;
        player.velocityX = 5; // Moving right

        // Test with different animation frames
        for (let i = 0; i < player.frameCount; i++) {
            player.frame = i;
            mockContext.drawImage.mockClear();

            player.render(mockContext);

            // When walking, frameIndex should be player.frame + 1
            expect(mockContext.drawImage).toHaveBeenCalledWith(
                expect.any(Object), // Image object
                (i + 1) * 32, 0, 32, 32, // Source coordinates (frame i+1)
                player.x, player.y, player.width, player.height // Destination coordinates
            );
        }
    });

    test('should select frame index 0 when idle', () => {
        player.isJumping = false;
        player.velocityX = 0; // Not moving
        player.direction = 'right'; // Facing right
        player.frame = 2; // This should be ignored when idle

        player.render(mockContext);

        // When idle and facing right, frameIndex should be 0
        expect(mockContext.drawImage).toHaveBeenCalledWith(
            expect.any(Object), // Image object
            0 * 32, 0, 32, 32, // Source coordinates (frame 0)
            player.x, player.y, player.width, player.height // Destination coordinates
        );
    });
});


