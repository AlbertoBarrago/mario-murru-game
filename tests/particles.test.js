import Particles from '../js/core/classes/particles.js';

describe('Particles', () => {
    let particles;
    let mockCtx;

    beforeEach(() => {
        particles = new Particles();

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
        expect(particles.particles.length).toBe(20);

        const usedColors = new Set(particles.particles.map(p => p.color));
        expect(usedColors.size).toBeGreaterThanOrEqual(1);
        expect(usedColors.size).toBeLessThanOrEqual(3);
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
        particles.createExplosion(100, 200, 5);
        const initialCount = particles.particles.length;

        particles.particles[0].update = jest.fn().mockReturnValue(false);
        particles.particles.slice(1).forEach(p => {
            p.update = jest.fn().mockReturnValue(true);
        });

        particles.update();

        expect(particles.particles.length).toBe(initialCount - 1);
    });

    test('should update score popups', () => {
        particles.createScorePopup(100, 200, 50);
        particles.createScorePopup(150, 250, 100);

        particles.scorePopups[0].life = 1;

        particles.update();

        expect(particles.scorePopups.length).toBe(1);
        expect(particles.scorePopups[0].y).toBe(249);
    });

    test('should render particles', () => {
        particles.createExplosion(100, 200, 1);
        particles.particles[0].render = jest.fn();

        particles.render(mockCtx);

        expect(particles.particles[0].render).toHaveBeenCalledWith(mockCtx);
    });

    test('should render score popups', () => {
        particles.createScorePopup(100, 200, 50);

        particles.render(mockCtx);

        expect(mockCtx.font).toBe('16px Arial');
        expect(mockCtx.textAlign).toBe('left');
        expect(mockCtx.fillText).toHaveBeenCalledWith('+50', 100, 200);
        expect(mockCtx.strokeText).toHaveBeenCalledWith('+50', 100, 200);
    });

    test('should handle empty score popups array', () => {
        particles.scorePopups = [];

        expect(() => {
            particles.update();
            particles.render(mockCtx);
        }).not.toThrow();
    });

    test('should handle particle lifecycle', () => {
        particles.createExplosion(100, 200, 1);
        const particle = particles.particles[0];

        let updateCallCount = 0;
        particle.update = jest.fn(() => {
            updateCallCount++;
            return updateCallCount === 1;
        });

        particles.update();
        expect(particles.particles.length).toBe(1);

        particles.update();
        expect(particles.particles.length).toBe(0);
    });

    test('should handle complete particle lifecycle', () => {
        particles.createExplosion(100, 200, 1);
        const particle = particles.particles[0];

        const initialX = particle.x;
        const initialY = particle.y;
        const initialLife = particle.life;

        const isAlive = particle.update();

        expect(isAlive).toBe(true);
        expect(particle.x).not.toBe(initialX);
        expect(particle.y).not.toBe(initialY);
        expect(particle.life).toBe(initialLife - 1);

        particle.life = 1;
        const isStillAlive = particle.update();
        expect(isStillAlive).toBe(false);
    });

    test('should pause and resume particle system', () => {
        particles.createExplosion(100, 200, 2);
        const particle1 = particles.particles[0];
        const particle2 = particles.particles[1];

        const initialVelocityX1 = particle1.velocityX;
        const initialVelocityY1 = particle1.velocityY;
        const initialVelocityX2 = particle2.velocityX;
        const initialVelocityY2 = particle2.velocityY;

        particles.pause();
        expect(particles.isPaused).toBe(true);
        expect(particles.savedParticles).toHaveLength(2);
        expect(particles.savedParticles[0]).toEqual({
            velocityX: initialVelocityX1,
            velocityY: initialVelocityY1
        });
        expect(particle1.velocityX).toBe(0);
        expect(particle1.velocityY).toBe(0);

        particles.resume();
        expect(particles.isPaused).toBe(false);
        expect(particles.savedParticles).toBeNull();
        expect(particle1.velocityX).toBe(initialVelocityX1);
        expect(particle1.velocityY).toBe(initialVelocityY1);
        expect(particle2.velocityX).toBe(initialVelocityX2);
        expect(particle2.velocityY).toBe(initialVelocityY2);
    });

    test('should not update particles while paused', () => {
        particles.createExplosion(100, 200, 1);
        const particle = particles.particles[0];
        const initialX = particle.x;
        const initialY = particle.y;

        particles.pause();
        particles.update();

        expect(particle.x).toBe(initialX);
        expect(particle.y).toBe(initialY);
    });

    test('should render particles correctly', () => {
        particles.createExplosion(100, 200, 1);
        const particle = particles.particles[0];

        const ctx = {
            beginPath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            closePath: jest.fn(),
            fillStyle: ''
        };

        particle.render(ctx);

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
