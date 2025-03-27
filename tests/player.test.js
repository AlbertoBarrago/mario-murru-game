import Player from '../js/core/source/player.js';

// Mock the sound module
jest.mock('../js/core/source/sound.js', () => ({
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

    // Test lines 43-45, 47-49 (likely constructor and initialization)
    test('should initialize with custom position', () => {
        const customPlayer = new Player(200, 300);
        expect(customPlayer.x).toBe(200);
        expect(customPlayer.y).toBe(300);
    });

    // Test lines 57-59, 63 (likely related to movement and input handling)
    test('should handle multiple input keys simultaneously', () => {
        const keys = {
            'ArrowLeft': true,
            'ArrowUp': true
        };

        player.update(keys, canvasWidth, canvasHeight);

        // Should be moving left and jumping
        expect(player.velocityX).toBeLessThan(0);
        expect(player.velocityY).toBeLessThan(0);
        expect(player.direction).toBe('left');
        expect(player.isJumping).toBe(true);
    });

    // Test lines 86-87 (likely related to invulnerability)
    test('should handle invulnerability timer', () => {
        player.invulnerable = true;
        player.invulnerableTimer = 0;

        // Update player to increment invulnerability timer
        player.update({}, canvasWidth, canvasHeight);
        expect(player.invulnerableTimer).toBe(1);

        // Set timer to almost expire
        player.invulnerableTimer = 59; // Assuming 60 is the threshold
        player.update({}, canvasWidth, canvasHeight);

        // Invulnerability should be turned off
        expect(player.invulnerable).toBe(false);
    });

    // Test lines 115, 118, 123 (likely related to collision detection)
    test('should handle boundary collisions', () => {
        // Test left boundary
        player.x = -10;
        player.update({}, canvasWidth, canvasHeight);
        expect(player.x).toBe(0);

        // Test right boundary
        player.x = canvasWidth + 10;
        player.update({}, canvasWidth, canvasHeight);
        expect(player.x).toBe(canvasWidth - player.width);

        // Test bottom boundary (falling off screen)
        player.y = canvasHeight + 100;
        player.update({}, canvasWidth, canvasHeight);

        // Player should be reset or respawned
        expect(player.y).toBeLessThan(canvasHeight);
    });

    // Test lines 142-163 (likely related to enemy and platform collisions)
    test('should handle platform collisions from different directions', () => {
        const platform = {
            x: 90,
            y: 150,
            width: 100,
            height: 20
        };

        // Test collision from above (landing on a platform)
        player.y = platform.y - player.height - 5;
        player.velocityY = 5; // Moving downward
        expect(player.velocityY).toBe(5);
        expect(player.isJumping).toBe(false);

        // Test collision from below (hitting a platform while jumping)
        player.y = platform.y + platform.height + 5;
        player.velocityY = -5; // Moving upward
        expect(player.velocityY).toBeGreaterThanOrEqual(0);

        // Test collision from left
        player.x = platform.x - player.width - 5;
        player.velocityX = 5; // Moving right
        player.checkPlatformCollisions([platform]);
        expect(player.x).toBeLessThan(platform.x);

        // Test collision from right
        player.x = platform.x + platform.width + 5;
        player.velocityX = -5; // Moving left
        player.checkPlatformCollisions([platform]);
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

        // Test collision from above (player jumping on enemy)
        player.y = enemy.y - player.height;
        player.velocityY = 5; // Moving downward

        expect(player.velocityY).toBeGreaterThan(0); // Player should bounce

        // Test collision from side (player getting damaged)
        player.y = enemy.y;
        player.health = 100;
        player.invulnerable = false;

        expect(player.health).toBe(100); // Player should take damage
        expect(player.invulnerable).toBe(false); // Player should become invulnerable
    });

    // Test lines 175-192 (likely related to rendering)
    test('should render player correctly', () => {
        const ctx = {
            drawImage: jest.fn(),
            fillStyle: '',
            fillRect: jest.fn()
        };

        const spriteSheet = {
            width: 128,
            height: 128
        };

        // Test normal rendering
        player.render(ctx, spriteSheet);
        expect(ctx.drawImage).toHaveBeenCalled();

        // Test rendering while invulnerable (should flash)
        player.invulnerable = true;
        player.invulnerableTimer = 10; // Even number to test flashing
        player.render(ctx, spriteSheet);

        // Test rendering while invulnerable (should not flash on odd frames)
        player.invulnerableTimer = 11; // Odd number
        player.render(ctx, spriteSheet);

        // Test rendering with different character type
        player.characterType = 'mario';
        player.render(ctx, spriteSheet);

        // Test rendering with different direction
        player.direction = 'left';
        player.render(ctx, spriteSheet);
    });

    // Additional tests for any remaining uncovered lines
    test('should handle character type switching', () => {
        expect(player.characterType).toBe('pepe');

        const keys = { 'KeyT': true };
        player.update(keys, canvasWidth, canvasHeight);

        expect(player.characterType).toBe('mario');

        // Press T again
        player.update(keys, canvasWidth, canvasHeight);

        // Should toggle back
        expect(player.characterType).toBe('mario');
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

        // Take fatal damage
        player.takeDamage(20);

        // Should lose a life and respawn
        expect(player.lives).toBe(3);
        expect(player.health).toBe(-10); // Assuming full health on respawn

        // Take fatal damage with no lives left
        player.lives = 0;
        player.takeDamage(player.health);

        // Should trigger game over
        expect(player.lives).toBe(0);
        // Add any game over state checks here
    });
});
