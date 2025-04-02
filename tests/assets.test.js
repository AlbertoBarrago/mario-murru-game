import { assets, loadAssets, checkAssetsLoaded } from '../js/assets';

describe('Assets', () => {
    let originalImage;
    let mockImage;

    beforeEach(() => {
        // Reset assets state
        assets.images = {};
        assets.sounds = {};
        assets.loaded = 0;
        assets.total = 0;

        // Mock Image constructor
        originalImage = global.Image;
        mockImage = function () {
            this.onload = null;
            this.onerror = null;
            this.src = '';
        };
        global.Image = jest.fn().mockImplementation(() => new mockImage());

        // Mock console.error
        jest.spyOn(console, 'error').mockImplementation(() => { });

        // Mock DOM elements
        document.getElementById = jest.fn().mockReturnValue({
            style: { display: 'none' }
        });
    });

    afterEach(() => {
        global.Image = originalImage;
        console.error.mockRestore();
        jest.clearAllMocks();
    });

    describe('loadAssets', () => {
        it('should initialize total asset count correctly', () => {
            loadAssets();
            expect(assets.total).toBe(5); // Current number of images to load
        });

        it('should create Image instances for each asset', () => {
            loadAssets();
            expect(global.Image).toHaveBeenCalledTimes(5);
        });

        it('should handle image loading errors and use placeholder', () => {
            loadAssets();
            const mockImages = Array.from({ length: 5 }, () => global.Image.mock.results[0].value);

            // Simulate error on first image
            mockImages[0].onerror();

            expect(console.error).toHaveBeenCalledWith('Failed to load image: assets/images/sprites/mario.svg');
            expect(assets.images['mario']).toBeDefined();
            expect(assets.images['mario'].src).toContain('data:image/png;base64');
            expect(assets.loaded).toBe(1);
        });

        it('should handle successful image loading', () => {
            loadAssets();
            const mockImages = Array.from({ length: 5 }, () => global.Image.mock.results[0].value);

            // Simulate successful load
            mockImages[0].onload();

            expect(assets.images['mario']).toBeDefined();
            expect(assets.loaded).toBe(1);
        });
    });

    describe('checkAssetsLoaded', () => {
        it('should call onComplete when all assets are loaded', () => {
            const onComplete = jest.fn();
            assets.loaded = 5;
            assets.total = 5;

            checkAssetsLoaded(onComplete);

            expect(document.getElementById).toHaveBeenCalledWith('loading');
            expect(onComplete).toHaveBeenCalled();
        });

        it('should not call onComplete when assets are still loading', () => {
            jest.useFakeTimers();
            const onComplete = jest.fn();
            assets.loaded = 3;
            assets.total = 5;

            checkAssetsLoaded(onComplete);
            jest.advanceTimersByTime(100);

            expect(onComplete).not.toHaveBeenCalled();
            jest.useRealTimers();
        });

        it('should hide loading screen when complete', () => {
            const onComplete = jest.fn();
            assets.loaded = 5;
            assets.total = 5;

            checkAssetsLoaded(onComplete);

            expect(document.getElementById).toHaveBeenCalledWith('loading');
            const loadingElement = document.getElementById('loading');
            expect(loadingElement.style.display).toBe('none');
        });
    });
});