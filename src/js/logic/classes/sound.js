/** @type {Object.<string, HTMLAudioElement>} */
const sounds = {};

// Define sound paths
const soundPaths = {
  jump: '../../../public/sounds/jump.wav',
  coin: '../../../public/sounds/coin.wav',
  damage: '../../../public/sounds/damage.wav',
  gameOver: '../../../public/sounds/game-over.wav',
  levelComplete: '../../../public/sounds/level-complete.wav',
  backgroundMusic: '../../../public/sounds/background.mp3'
};

/**
 * Plays a sound by its name
 * @param {string} soundName - The name of the sound to play
 */
function playSound(soundName) {
  if (sounds[soundName]) {
    sounds[soundName].currentTime = 0;
    const playPromise = sounds[soundName].play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error(`Error playing sound ${soundName}:`, error);
        if (error.name === 'NotAllowedError') {
          console.warn('Sound autoplay was blocked by the browser. User interaction is required first.');
        }
      });
    }
  } else {
    console.warn(`Sound ${soundName} not loaded or doesn't exist`);
  }
}

/**
 * Stops a sound by its name
 * @param {string} soundName - The name of the sound to stop
 */
function stopSound(soundName) {
  if (sounds[soundName]) {
    sounds[soundName].pause();
    sounds[soundName].currentTime = 0;
  }
}

/** @type {boolean} */
let muted = false;

/**
 * Toggles mute state for all sounds
 * @returns {boolean} The new mute state
 */
function toggleMute() {
  muted = !muted;
  Object.values(sounds).forEach(sound => {
    sound.muted = muted;
  });
  return muted;
}

/**
 * Initializes all sounds and sets up event listeners
 */
function initSounds() {
  // Create audio objects only during initialization
  Object.entries(soundPaths).forEach(([key, path]) => {
    try {
      sounds[key] = new Audio(path);

      // Set properties for background music
      if (key === 'backgroundMusic') {
        sounds[key].loop = true;
        sounds[key].volume = 0.5;
      }

      // Add event listeners
      sounds[key].addEventListener('play', () => {
        console.warn(`Playing sound: ${key}`);
      });

      sounds[key].addEventListener('error', (e) => {
        console.error(`Error with sound: ${key}`, e);
      });

      // Preload the audio
      sounds[key].load();
    } catch (error) {
      console.error(`Failed to initialize sound: ${key}`, error);
    }
  });

}

export { sounds, playSound, stopSound, toggleMute, initSounds };