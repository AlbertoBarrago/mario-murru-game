import Particles from '../js/core/classes/particles.js';

describe('Particles', () => {
    let particles;
    let mockCtx;

    beforeEach(() => {
        // Create a new Particles instance
        particles = new Particles();

        // Mock canvas context
        mockCtx = {
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            font: '',
            textAlign: '',
            fillText: jest.fn(),
            strokeText: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            closePath: jest.fn()
        };
    });

    test('should initialize with empty particles array', () => {
        expect(particles.particles).toEqual([]);
        expect(particles.scorePopups).toBeUndefined();
    });

    test('should create explosion particles', () => {
        particles.createExplosion(100, 200, 10, ['#ff0000']);
        expect(particles.particles.length).toBe(10);

        // Check properties of created particles
        particles.particles.forEach(particle => {
            expect(particle).toHaveProperty('x', 100);
            expect(particle).toHaveProperty('y', 200);
            expect(particle).toHaveProperty('velocityX');
            expect(particle).toHaveProperty('velocityY');
            expect(particle).toHaveProperty('size');
            expect(particle).toHaveProperty('color', '#ff0000');
            expect(particle).toHaveProperty('life');
        });
    });

    test('should create explosion with default parameters', () => {
        particles.createExplosion(100, 200);
        expect(particles.particles.length).toBe(20); // Default count is 20

        // Check that default colors are used
        const usedColors = new Set(particles.particles.map(p => p.color));
        expect(usedColors.size).toBeGreaterThanOrEqual(1);
        expect(usedColors.size).toBeLessThanOrEqual(3); // Default has 3 colors
    });

    test('should create score popup', () => {
        particles.createScorePopup(150, 250, 100);
        expect(particles.scorePopups.length).toBe(1);

        const popup = particles.scorePopups[0];
        expect(popup).toEqual({
            x: 150,
            y: 250,
            score: 100,
            life: 40,
            velocityY: -1
        });
    });

    test('should update particles', () => {
        // Create some particles
        particles.createExplosion(100, 200, 5);
        const initialCount = particles.particles.length;

        // Mock the update method to return false for one particle (to test filtering)
        particles.particles[0].update = jest.fn().mockReturnValue(false);
        particles.particles.slice(1).forEach(p => {
            p.update = jest.fn().mockReturnValue(true);
        });

        // Update particles
        particles.update();

        // Check that one particle was removed
        expect(particles.particles.length).toBe(initialCount - 1);
    });

    test('should update score popups', () => {
        // Create some score popups
        particles.createScorePopup(100, 200, 50);
        particles.createScorePopup(150, 250, 100);

        // Set one popup to expire in the next update
        particles.scorePopups[0].life = 1;

        // Update
        particles.update();

        // Check that one popup was removed
        expect(particles.scorePopups.length).toBe(1);

        // Check that the remaining popup's position was updated
        expect(particles.scorePopups[0].y).toBe(249); // 250 - 1
    });

    test('should render particles', () => {
        // Create a particle with mocked render method
        particles.createExplosion(100, 200, 1);
        particles.particles[0].render = jest.fn();

        // Render
        particles.render(mockCtx);

        // Check that particle's render method was called
        expect(particles.particles[0].render).toHaveBeenCalledWith(mockCtx);
    });

    test('should render score popups', () => {
        // Create a score popup
        particles.createScorePopup(100, 200, 50);

        // Render
        particles.render(mockCtx);

        // Check that context methods were called correctly
        expect(mockCtx.font).toBe('16px Arial');
        expect(mockCtx.textAlign).toBe('left'); // Should be reset to 'left' after rendering
        expect(mockCtx.fillText).toHaveBeenCalledWith('+50', 100, 200);
        expect(mockCtx.strokeText).toHaveBeenCalledWith('+50', 100, 200);
    });

    test('should handle empty score popups array', () => {
        // Initialize empty score popups array
        particles.scorePopups = [];

        // Update and render should not throw errors
        expect(() => {
            particles.update();
            particles.render(mockCtx);
        }).not.toThrow();
    });

    test('should handle particle lifecycle', () => {
        // Create a particle
        particles.createExplosion(100, 200, 1);
        const particle = particles.particles[0];

        // Mock the internal Particle class update method
        // First call returns true (particle alive)
        // Second call returns false (particle dead)
        let updateCallCount = 0;
        const originalUpdate = particle.update;
        particle.update = jest.fn(() => {
            updateCallCount++;
            return updateCallCount === 1;
        });

        // First update - particle stays alive
        particles.update();
        expect(particles.particles.length).toBe(1);

        // Second update - particle is removed
        particles.update();
        expect(particles.particles.length).toBe(0);
    });

    test('should handle complete particle lifecycle', () => {
        // Create a particle and access it directly
        particles.createExplosion(100, 200, 1);
        const particle = particles.particles[0];

        // Store initial values
        const initialX = particle.x;
        const initialY = particle.y;
        const initialLife = particle.life;

        // Call update directly to test internal behavior
        const isAlive = particle.update();

        // Verify particle was updated correctly
        expect(isAlive).toBe(true);
        expect(particle.x).not.toBe(initialX); // Position should change
        expect(particle.y).not.toBe(initialY);
        expect(particle.life).toBe(initialLife - 1); // Life should decrease

        // Force particle to expire
        particle.life = 1;
        const isStillAlive = particle.update();
        expect(isStillAlive).toBe(false); // Should return false when life reaches 0
    });

    test('should render particles correctly', () => {
        // Create a particle
        particles.createExplosion(100, 200, 1);
        const particle = particles.particles[0];

        // Mock context
        const ctx = {
            beginPath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            closePath: jest.fn(),
            fillStyle: ''
        };

        // Call render directly
        particle.render(ctx);

        // Verify context methods were called correctly
        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.arc).toHaveBeenCalledWith(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );
        expect(ctx.fillStyle).toBe(particle.color);
        expect(ctx.fill).toHaveBeenCalled();
    });
});
