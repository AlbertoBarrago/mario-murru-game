// Sound module for Mario Murru game

// Sound assets
const sounds = {
    jump: new Audio('assets/sounds/jump.wav'),
    coin: new Audio('assets/sounds/coin.wav'),
    damage: new Audio('assets/sounds/damage.wav'),
    gameOver: new Audio('assets/sounds/game-over.wav'),
    levelComplete: new Audio('assets/sounds/level-complete.wav'),
    backgroundMusic: new Audio('assets/sounds/background.mp3')
};

// Configure background music
sounds.backgroundMusic.loop = true;
sounds.backgroundMusic.volume = 0.5;

// Play sound function
function playSound(soundName) {
    // Check if sound exists
    if (sounds[soundName]) {
        // Reset the sound to the beginning if it's already playing
        sounds[soundName].currentTime = 0;
        // Play the sound
        const playPromise = sounds[soundName].play();

        // Handle play promise to catch autoplay restrictions
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

// Stop sound function
function stopSound(soundName) {
    if (sounds[soundName]) {
        sounds[soundName].pause();
        sounds[soundName].currentTime = 0;
    }
}

// Toggle mute all sounds
let muted = false;

function toggleMute() {
    muted = !muted;

    // Apply mute setting to all sounds
    Object.values(sounds).forEach(sound => {
        sound.muted = muted;
    });

    return muted;
}

// Initialize sounds
function initSounds() {
    // Preload all sounds
    Object.values(sounds).forEach(sound => {
        sound.load();

        // Add event listeners to handle autoplay restrictions
        sound.addEventListener('play', () => {
            console.log(`Playing sound: ${Object.keys(sounds).find(key => sounds[key] === sound)}`);
        });

        sound.addEventListener('error', (e) => {
            console.error(`Error with sound: ${Object.keys(sounds).find(key => sounds[key] === sound)}`, e);
        });
    });
}

export { sounds, playSound, stopSound, toggleMute, initSounds };