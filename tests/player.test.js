import Player from '../js/core/source/player.js';

// Mock the sound module to avoid actual sound playback during tests
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
    });

    test('should initialize with correct default values', () => {
        expect(player.x).toBe(100);
        expect(player.y).toBe(100);
        expect(player.width).toBe(32);
        expect(player.height).toBe(32);
        expect(player.velocityX).toBe(0);
        expect(player.velocityY).toBe(0);
        expect(player.isJumping).toBe(false);
        expect(player.direction).toBe('right');
        expect(player.lives).toBe(3);
        expect(player.health).toBe(100);
        expect(player.characterType).toBe('pepe');
    });

    test('should move left when left arrow key is pressed', () => {
        const keys = { 'ArrowLeft': true };
        player.update(keys, canvasWidth, canvasHeight);

        expect(player.velocityX).toBeLessThan(0);
        expect(player.direction).toBe('left');
    });

    test('should move right when right arrow key is pressed', () => {
        const keys = { 'ArrowRight': true };
        player.update(keys, canvasWidth, canvasHeight);

        expect(player.velocityX).toBeGreaterThan(0);
        expect(player.direction).toBe('right');
    });

    test('should jump when up arrow key is pressed', () => {
        const keys = { 'ArrowUp': true };
        player.update(keys, canvasWidth, canvasHeight);

        expect(player.velocityY).toBeLessThan(0);
        expect(player.isJumping).toBe(true);
    });

    test('should switch character type when T key is pressed', () => {
        expect(player.characterType).toBe('pepe');

        const keys = { 'KeyT': true };
        player.update(keys, canvasWidth, canvasHeight);

        expect(player.characterType).toBe('mario');

        // Press T again to switch back
        player.update(keys, canvasWidth, canvasHeight);
        // Should not change because lastKeyT is true
        expect(player.characterType).toBe('mario');

        // Release T key
        const keysReleased = { 'KeyT': false };
        player.update(keysReleased, canvasWidth, canvasHeight);

        // Press T again
        player.update(keys, canvasWidth, canvasHeight);
        expect(player.characterType).toBe('pepe');
    });

    test('should apply gravity to vertical velocity', () => {
        const initialVelocityY = player.velocityY;
        const keys = {};
        player.update(keys, canvasWidth, canvasHeight);

        expect(player.velocityY).toBeGreaterThan(initialVelocityY);
    });

    test('should not move beyond canvas boundaries', () => {
        // Test left boundary
        player.x = -10;
        const keys = {};
        player.update(keys, canvasWidth, canvasHeight);
        expect(player.x).toBe(0);

        // Test right boundary
        player.x = canvasWidth + 10;
        player.update(keys, canvasWidth, canvasHeight);
        expect(player.x).toBe(canvasWidth - player.width);

        // Test bottom boundary
        player.y = canvasHeight + 10;
        player.update(keys, canvasWidth, canvasHeight);
        expect(player.y).toBe(canvasHeight - player.height);
        expect(player.isJumping).toBe(false);
    });

    test('should become invulnerable after taking damage', () => {
        player.takeDamage(25);
        expect(player.health).toBe(75);
        expect(player.invulnerable).toBe(true);

        // Simulate multiple frames to end invulnerability
        for (let i = 0; i < player.invulnerableDuration + 1; i++) {
            player.update({}, canvasWidth, canvasHeight);
        }

        expect(player.invulnerable).toBe(false);
    });
});