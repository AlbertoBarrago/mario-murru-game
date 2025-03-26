// Game assets
const assets = {
    images: {},
    sounds: {},
    loaded: 0,
    total: 0
};

// Asset loading
function loadAssets() {
    // Define assets to load
    const imagesToLoad = [
        { name: 'player', src: 'assets/images/mario-murru.png' },
        { name: 'tiles', src: 'assets/images/tiles.png' },
        { name: 'enemies', src: 'assets/images/enemies.png' },
        { name: 'coin', src: 'assets/images/coin.png' },
        { name: 'background', src: 'assets/images/background.png' }
    ];

    assets.total = imagesToLoad.length;

    // Load each image
    imagesToLoad.forEach(img => {
        const image = new Image();
        image.src = img.src;
        image.onload = () => {
            assets.images[img.name] = image;
            assets.loaded++;
        };
        image.onerror = () => {
            console.error(`Failed to load image: ${img.src}`);
            // Use placeholder for failed loads
            const placeholder = new Image();
            placeholder.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
            assets.images[img.name] = placeholder;
            assets.loaded++;
        };
    });
}

function checkAssetsLoaded(onComplete) {
    if (assets.loaded === assets.total) {
        // All assets loaded, call the completion callback
        document.getElementById('loading').style.display = 'none';
        onComplete();
    } else {
        // Check again in a moment
        setTimeout(() => checkAssetsLoaded(onComplete), 100);
    }
}

export { assets, loadAssets, checkAssetsLoaded };