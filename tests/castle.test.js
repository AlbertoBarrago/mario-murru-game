import Castle from '../js/core/classes/castle';

describe('Castle', () => {
    let castle;
    let mockCtx;

    beforeEach(() => {
        // Initialize castle at position (100, 200)
        castle = new Castle(100, 200);

        // Mock canvas context
        mockCtx = {
            fillStyle: '',
            fillRect: jest.fn(),
            drawImage: jest.fn()
        };

        // Mock assets
        global.assets = {
            images: {
                castle: null
            }
        };
    });

    describe('constructor', () => {
        it('should initialize castle with correct dimensions', () => {
            expect(castle.x).toBe(100);
            expect(castle.y).toBe(200);
            expect(castle.width).toBe(96);
            expect(castle.height).toBe(96);
        });

        it('should create barriers with correct positions and dimensions', () => {
            expect(castle.barriers).toHaveLength(4);

            // Left barrier
            expect(castle.barriers[0]).toEqual({
                x: castle.x - 32,
                y: castle.y + 32,
                width: 32,
                height: 8
            });

            // Right barrier
            expect(castle.barriers[1]).toEqual({
                x: castle.x + castle.width,
                y: castle.y + 32,
                width: 32,
                height: 8
            });

            // Left vertical barrier
            expect(castle.barriers[2]).toEqual({
                x: castle.x - 32,
                y: castle.y - 16,
                width: 8,
                height: 48
            });

            // Right vertical barrier
            expect(castle.barriers[3]).toEqual({
                x: castle.x + castle.width + 24,
                y: castle.y - 16,
                width: 8,
                height: 48
            });
        });
    });

    describe('render', () => {

        it('should use fallback rendering when sprite is not available', () => {
            // Ensure castle sprite is null
            global.assets.images.castle = null;

            castle.render(mockCtx);

            // Check fallback castle rendering
            expect(mockCtx.fillStyle).toBe('#8B4513');
            expect(mockCtx.fillRect).toHaveBeenCalledWith(
                castle.x,
                castle.y,
                castle.width,
                castle.height
            );
        });

        it('should render barriers with correct style and dimensions', () => {
            castle.render(mockCtx);

            // Check barrier rendering
            expect(mockCtx.fillStyle).toBe('#8B4513');
            castle.barriers.forEach(barrier => {
                expect(mockCtx.fillRect).toHaveBeenCalledWith(
                    barrier.x,
                    barrier.y,
                    barrier.width,
                    barrier.height
                );
            });
        });
    });
});