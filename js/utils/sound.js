/** @type {Object.<string, HTMLAudioElement>} */
const sounds = {
    jump: new Audio('assets/sounds/jump.wav'),
    coin: new Audio('assets/sounds/coin.wav'),
    damage: new Audio('assets/sounds/damage.wav'),
    gameOver: new Audio('assets/sounds/game-over.wav'),
    levelComplete: new Audio('assets/sounds/level-complete.wav'),
    backgroundMusic: new Audio('assets/sounds/background.mp3')
};

sounds.backgroundMusic.loop = true;
sounds.backgroundMusic.volume = 0.5;

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
    Object.values(sounds).forEach(sound => {
        sound.load();
        sound.addEventListener('play', () => {
            console.log(`Playing sound: ${Object.keys(sounds).find(key => sounds[key] === sound)}`);
        });
        sound.addEventListener('error', (e) => {
            console.error(`Error with sound: ${Object.keys(sounds).find(key => sounds[key] === sound)}`, e);
        });
    });
}

export { sounds, playSound, stopSound, toggleMute, initSounds };