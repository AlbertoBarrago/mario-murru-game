/**
 * @typedef {Object} Assets
 * @property {Object.<string, HTMLImageElement>} images - Collection of loaded game images
 * @property {Object.<string, HTMLAudioElement>} sounds - Collection of loaded game sounds
 * @property {number} loaded - Counter for loaded public
 * @property {number} total - Total number of public to load
 */

/** @type {Assets} */
const assets = {
  images: {},
  sounds: {},
  loaded: 0,
  total: 0
};

/**
 * Initiates loading of all game public
 * @function
 */
function loadAssets() {
  const imagesToLoad = [
    { name: 'mario', src: 'public/images/sprites/mario.svg' },
    { name: 'pepe', src: 'public/images/sprites/pepe.svg' },
    { name: 'enemies_sprite', src: 'public/images/sprites/enemies.svg' },
    { name: 'princess_sprite', src: 'public/images/sprites/princess.svg' },
    { name: 'castle', src: 'public/images/png/castle.png' }
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
 * Checks if all public have finished loading
 * @param {Function} onComplete - Callback function to execute when all public are loaded
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