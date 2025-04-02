import Princess from '../src/js/logic/classes/princess';
import Castle from '../src/js/logic/classes/castle';

describe('Princess', () => {
    let princess;
    let mockCtx;
    let mockParticleSystem;
    let mockGameState;

    beforeEach(() => {
        // Initialize princess at position (200, 300)
        princess = new Princess(200, 300);

        // Mock canvas context
        mockCtx = {
            fillStyle: '',
            fillRect: jest.fn(),
            drawImage: jest.fn()
        };

        // Mock particle system
        mockParticleSystem = {
            createExplosion: jest.fn(),
            createScorePopup: jest.fn()
        };

        // Mock game state
        mockGameState = {
            enemies: []
        };

        // Mock public
        global.assets = {
            images: {
                princess_sprite: null,
                castle: null
            }
        };
    });

    describe('constructor', () => {
        it('should initialize princess with correct dimensions and position', () => {
            expect(princess.x).toBe(200);
            expect(princess.y).toBe(252); // 300 - 48 (adjusted position)
            expect(princess.width).toBe(32);
            expect(princess.height).toBe(32);
            expect(princess.animationFrame).toBe(0);
            expect(princess.frameCount).toBe(0);
            expect(princess.isReached).toBe(false);
            expect(princess.canBeReached).toBe(false);
        });

        it('should create castle at correct position', () => {
            expect(princess.castle).toBeInstanceOf(Castle);
            expect(princess.castle.x).toBe(168); // 200 - 32
            expect(princess.castle.y).toBe(252); // 300 - 48
        });
    });

    describe('update', () => {
        it('should update animation frame after 15 frames', () => {
            // Update 14 frames
            for (let i = 0; i < 14; i++) {
                princess.update();
                expect(princess.animationFrame).toBe(0);
            }

            // 15th frame should change animation
            princess.update();
            expect(princess.animationFrame).toBe(1);

            // Next 14 frames
            for (let i = 0; i < 14; i++) {
                princess.update();
                expect(princess.animationFrame).toBe(1);
            }

            // Back to frame 0
            princess.update();
            expect(princess.animationFrame).toBe(0);
        });

        it('should not update animation when reached', () => {
            princess.isReached = true;
            princess.update();
            expect(princess.animationFrame).toBe(0);
            expect(princess.frameCount).toBe(0);
        });
    });

    describe('render', () => {

        it('should use fallback rendering when sprite is not available', () => {
            princess.render(mockCtx);

            expect(mockCtx.fillStyle).toBe('#ff69b4');
            expect(mockCtx.fillRect).toHaveBeenCalledWith(
                princess.x,
                princess.y,
                princess.width,
                princess.height
            );
        });
    });

    describe('reach', () => {
        it('should not allow reaching when canBeReached is false', () => {
            princess.reach(mockParticleSystem, mockGameState);

            expect(princess.isReached).toBe(false);
            expect(mockParticleSystem.createExplosion).not.toHaveBeenCalled();
            expect(mockParticleSystem.createScorePopup).not.toHaveBeenCalled();
        });

        it('should not allow reaching when enemies exist', () => {
            princess.canBeReached = true;
            mockGameState.enemies = [{}]; // Add mock enemy

            princess.reach(mockParticleSystem, mockGameState);

            expect(princess.isReached).toBe(false);
            expect(mockParticleSystem.createScorePopup).toHaveBeenCalledWith(
                princess.x + princess.width / 2,
                princess.y - 20,
                'Defeat all enemies first!',
                '#ff0000'
            );
        });

        it('should trigger victory effects when conditions are met', () => {
            princess.canBeReached = true;
            mockGameState.enemies = []; // No enemies

            princess.reach(mockParticleSystem, mockGameState);

            expect(princess.isReached).toBe(true);
            expect(mockParticleSystem.createExplosion).toHaveBeenCalledWith(
                princess.x + princess.width / 2,
                princess.y + princess.height / 2,
                30,
                ['#ff69b4', '#ff1493', '#ffb6c1', '#ffc0cb']
            );
            expect(mockParticleSystem.createScorePopup).toHaveBeenCalledWith(
                princess.x + princess.width / 2,
                princess.y,
                100
            );
        });

        it('should not trigger effects multiple times', () => {
            princess.canBeReached = true;
            mockGameState.enemies = [];

            // First reach
            princess.reach(mockParticleSystem, mockGameState);
            expect(princess.isReached).toBe(true);

            // Reset mock calls
            mockParticleSystem.createExplosion.mockClear();
            mockParticleSystem.createScorePopup.mockClear();

            // Try to reach again
            princess.reach(mockParticleSystem, mockGameState);

            expect(mockParticleSystem.createExplosion).not.toHaveBeenCalled();
            expect(mockParticleSystem.createScorePopup).not.toHaveBeenCalled();
        });
    });
});