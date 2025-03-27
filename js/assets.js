/**
 * @typedef {Object} Assets
 * @property {Object.<string, HTMLImageElement>} images - Collection of loaded game images
 * @property {Object.<string, AudioElement>} sounds - Collection of loaded game sounds
 * @property {number} loaded - Counter for loaded assets
 * @property {number} total - Total number of assets to load
 */

/** @type {Assets} */
const assets = {
    images: {},
    sounds: {},
    loaded: 0,
    total: 0
};

/**
 * Initiates loading of all game assets
 * @function
 */
function loadAssets() {
    const imagesToLoad = [
        { name: 'player', src: 'assets/images/mario-murru.png' },
        { name: 'tiles', src: 'assets/images/tiles.png' },
        { name: 'enemies', src: 'assets/images/enemies.png' },
        { name: 'coin', src: 'assets/images/coin.png' },
        { name: 'background', src: 'assets/images/background.png' }
    ];

    assets.total = imagesToLoad.length;

    imagesToLoad.forEach(img => {
        const image = new Image();
        image.src = img.src;
        image.onload = () => {
            assets.images[img.name] = image;
            assets.loaded++;
        };
        image.onerror = () => {
            console.error(`Failed to load image: ${img.src}`);
            const placeholder = new Image();
            placeholder.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
            assets.images[img.name] = placeholder;
            assets.loaded++;
        };
    });
}

/**
 * Checks if all assets have finished loading
 * @param {Function} onComplete - Callback function to execute when all assets are loaded
 */
function checkAssetsLoaded(onComplete) {
    if (assets.loaded === assets.total) {
        document.getElementById('loading').style.display = 'none';
        onComplete();
    } else {
        setTimeout(() => checkAssetsLoaded(onComplete), 100);
    }
}

export { assets, loadAssets, checkAssetsLoaded };