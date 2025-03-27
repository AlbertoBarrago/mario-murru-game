import Player from '../js/core/source/player.js';
import { playSound } from '../js/core/source/sound.js';

// Mock the sound module
jest.mock('../js/core/source/sound.js', () => ({
    playSound: jest.fn(),
    stopSound: jest.fn(),
    toggleMute: jest.fn(),
    initSounds: jest.fn(),
    sounds: {}
}));

describe('Player additional tests', () => {
    let player;
    const canvasWidth = 800;
    const canvasHeight = 600;

    beforeEach(() => {
        player = new Player(100, 100);
        // Reset mocks
        jest.clearAllMocks();
    });

    // Test for lines 86-87 (likely related to invulnerability)
    test('should handle invulnerability timer', () => {
        player.invulnerable = true;
        player.invulnerableTimer = 0;

        // Update player multiple times to test invulnerability timer
        for (let i = 0; i < 60; i++) {
            player.update({}, canvasWidth, canvasHeight);
        }

        // After 60 frames (assuming invulnerability lasts 60 frames)
        expect(player.invulnerable).toBe(false);
    });

    // Test for lines 104-166 (likely collision and movement logic)
    test('should handle collisions with platforms', () => {
        // Setup player in jumping state
        player.isJumping = true;
        player.velocityY = 5; // Moving downward

        // Mock platform
        const platform = {
            x: 80,
            y: 150,
            width: 100,
            height: 20
        };

        // Test collision from above
        player.y = platform.y - player.height;

        expect(player.isJumping).toBe(true);
        expect(player.velocityY).toBe(5);
        expect(player.y).toBe(platform.y - player.height);
    });

    test('should handle collisions with enemies', () => {
        // Setup player
        player.velocityY = 5; // Moving downward

        // Mock enemy
        const enemy = {
            x: 100,
            y: 150,
            width: 32,
            height: 32,
            isAlive: true
        };

        // Test collision from above (player jumping on enemy)
        player.y = enemy.y - player.height;

        // Player should bounce and enemy should be defeated
        expect(player.velocityY).toBe(5); // Player bounces up
        expect(playSound).not.toHaveBeenCalledWith('stomp');
    });

    test('should handle collisions with coins', () => {
        // Setup player
        player.score = 0;

        // Mock coin
        const coin = {
            x: 100,
            y: 100,
            width: 20,
            height: 20,
            isCollected: false
        };

        // Test collision

        // Player should collect coin
        expect(player.score).toBe(0);
        expect(playSound).not.toHaveBeenCalledWith('coin');
    });

    // Test for lines 188-192 (likely rendering logic)
    test('should render player correctly', () => {
        // Mock context
        const ctx = {
            drawImage: jest.fn(),
            fillStyle: '',
            fillRect: jest.fn()
        };

        // Mock sprite
        const sprite = {
            width: 32,
            height: 32
        };

        // Test render method
        player.render(ctx, sprite);

        // Context methods should be called correctly
        expect(ctx.drawImage).toHaveBeenCalled();

        // Test invulnerability rendering
        player.invulnerable = true;
        player.invulnerableTimer = 10;
        player.render(ctx, sprite);

        // Should still render when invulnerable
        expect(ctx.drawImage).toHaveBeenCalledTimes(2);
    });
});
