// Main game file for Mario Murru

// Import sound module
import { sounds, playSound, stopSound, toggleMute, initSounds } from './sound.js';

// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -15;
const MOVEMENT_SPEED = 5;
const FRICTION = 0.8;
const MAX_HEALTH = 100;
const INITIAL_LIVES = 3;
const ENEMY_DAMAGE = 25;
const COIN_SCORE = 10;

// Game state
let gameLoaded = false;
let gameStarted = false;
let currentLevel = 1;
let score = 0;
let gameOver = false;

// Game assets
const assets = {
    images: {},
    sounds: {},
    loaded: 0,
    total: 0
};

// Game objects
let player;
let platforms = [];
let enemies = [];
let coins = [];
let backgroundLayers = [];

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game UI elements
let healthBar = {
    x: 20,
    y: 15,
    width: 150,
    height: 15,
    borderWidth: 2
};

let livesDisplay = {
    x: 20,
    y: 60,
    spacing: 25
};

let levelDisplay = {
    x: canvas.width - 100,
    y: 30
};

let scoreDisplay = {
    x: canvas.width - 100,
    y: 60
};

// Input handling
const keys = {};

// Game initialization
function init() {
    // Initialize sounds
    initSounds();

    // Load assets
    loadAssets();

    // Set up event listeners
    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;

        // Toggle sound with M key
        if (e.code === 'KeyM') {
            toggleMute();
        }

        // Quit game with Q key
        if (e.code === 'KeyQ') {
            quitGame();
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    // Expose game state variables to window for access from HTML
    window.gameStarted = false;
    window.gameRunning = false;

    // Create setter functions to properly update the game state
    window.startGame = function () {
        gameStarted = true;
        gameRunning = true;
    };

    // Start game loop once assets are loaded
    checkAssetsLoaded();
}

// Asset loading
function loadAssets() {
    // Define assets to load - removing spritesheet
    const imagesToLoad = [
        // Only load necessary assets
        // ADD sprites here...
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

function checkAssetsLoaded() {
    if (assets.loaded === assets.total) {
        // All assets loaded, initialize game objects
        setupGame();
        document.getElementById('loading').style.display = 'none';
        gameLoaded = true;
        // Start the game loop
        requestAnimationFrame(gameLoop);
    } else {
        // Check again in a moment
        setTimeout(checkAssetsLoaded, 100);
    }
}

// Game setup
function setupGame() {
    // Create player - removing sprite information
    player = {
        x: 100,
        y: 300,
        width: 32,
        height: 32,
        velocityX: 0,
        velocityY: 0,
        isJumping: false,
        direction: 'right',
        frame: 0,
        frameCount: 3,
        frameDelay: 5,
        frameTimer: 0,
        health: MAX_HEALTH,
        lives: INITIAL_LIVES,
        invulnerable: false,
        invulnerableTimer: 0,
        invulnerableDuration: 60,
        characterType: 'pepe' // 'human' or 'pepe'
    };

    // Create platforms
    // Ground
    platforms.push({
        x: 0,
        y: 450,
        width: 800,
        height: 30
    });

    // Some platforms
    platforms.push({
        x: 200,
        y: 350,
        width: 100,
        height: 20
    });

    platforms.push({
        x: 400,
        y: 300,
        width: 100,
        height: 20
    });

    platforms.push({
        x: 600,
        y: 250,
        width: 100,
        height: 20
    });

    // Create enemies - removing sprite information
    enemies.push({
        x: 300,
        y: 418,
        width: 32,
        height: 32,
        velocityX: 2,
        direction: 'right',
        frame: 0,
        frameCount: 2,
        frameDelay: 10,
        frameTimer: 0
    });

    // Create coins
    for (let i = 0; i < 5; i++) {
        coins.push({
            x: 150 + i * 120,
            y: 300,
            width: 16,
            height: 16,
            frame: 0,
            frameCount: 4,
            frameDelay: 8,
            frameTimer: 0,
            collected: false
        });
    }
}

// Game loop
function gameLoop(timestamp) {
    if (!gameLoaded) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        // Just render the static elements but don't update game state
        render();
    } else if (gameOver) {
        renderGameOver();
    } else {
        // If game is started, it should be running
        gameRunning = true;

        // Start background music if it's not playing
        if (sounds.backgroundMusic.paused) {
            playSound('backgroundMusic');
        }

        // Update game objects
        update();

        // Render game objects
        render();

        // Check if level is complete
        checkLevelComplete();
    }

    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // Update player
    updatePlayer();

    // Update enemies
    updateEnemies();

    // Update coins
    updateCoins();

    // Check collisions
    checkCollisions();

    // Update player invulnerability
    if (player.invulnerable) {
        player.invulnerableTimer++;
        if (player.invulnerableTimer >= player.invulnerableDuration) {
            player.invulnerable = false;
            player.invulnerableTimer = 0;
        }
    }
}

// Update player
function updatePlayer() {
    // Handle input
    if (keys['ArrowLeft'] || keys['KeyA']) {
        player.velocityX = -MOVEMENT_SPEED;
        player.direction = 'left';
        player.frameTimer++;
    } else if (keys['ArrowRight'] || keys['KeyD']) {
        player.velocityX = MOVEMENT_SPEED;
        player.direction = 'right';
        player.frameTimer++;
    } else {
        player.velocityX *= FRICTION;
        player.frameTimer = 0;
        player.frame = 0;
    }

    // Handle jumping
    if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && !player.isJumping) {
        player.velocityY = JUMP_FORCE;
        player.isJumping = true;
        playSound('jump');
    }

    // Apply gravity
    player.velocityY += GRAVITY;

    // Limit falling speed to prevent tunneling through platforms
    if (player.velocityY > 15) {
        player.velocityY = 15;
    }

    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Boundary checks
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Add bottom boundary check to prevent falling through the canvas
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }

    // Animation
    if (player.frameTimer > player.frameDelay) {
        player.frame = (player.frame + 1) % player.frameCount;
        player.frameTimer = 0;
    }
}

// Update enemies
function updateEnemies() {
    enemies.forEach(enemy => {
        // Move enemy
        enemy.x += enemy.velocityX;

        // Boundary checks and direction change
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            enemy.velocityX *= -1;
            enemy.direction = enemy.velocityX > 0 ? 'right' : 'left';
        }

        // Animation
        enemy.frameTimer++;
        if (enemy.frameTimer > enemy.frameDelay) {
            enemy.frame = (enemy.frame + 1) % enemy.frameCount;
            enemy.frameTimer = 0;
        }
    });
}

// Update coins
function updateCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            // Animation
            coin.frameTimer++;
            if (coin.frameTimer > coin.frameDelay) {
                coin.frame = (coin.frame + 1) % coin.frameCount;
                coin.frameTimer = 0;
            }
        }
    });
}

// Check collisions
function checkCollisions() {
    // Player-Platform collisions
    let onGround = false;

    platforms.forEach(platform => {
        // Get the overlap between player and platform
        const overlapX = Math.min(player.x + player.width, platform.x + platform.width) -
            Math.max(player.x, platform.x);
        const overlapY = Math.min(player.y + player.height, platform.y + platform.height) -
            Math.max(player.y, platform.y);

        // Check if there's an actual collision
        if (overlapX > 0 && overlapY > 0) {
            // Determine which side of the collision is smaller (to resolve that way)
            if (overlapX < overlapY) {
                // Horizontal collision
                if (player.x < platform.x) {
                    // Collision from left
                    player.x = platform.x - player.width;
                } else {
                    // Collision from right
                    player.x = platform.x + platform.width;
                }
                player.velocityX = 0;
            } else {
                // Vertical collision
                if (player.y < platform.y) {
                    // Collision from above (landing)
                    player.y = platform.y - player.height;
                    player.velocityY = 0;
                    player.isJumping = false;
                    onGround = true;
                } else {
                    // Collision from below (hitting head)
                    player.y = platform.y + platform.height;
                    player.velocityY = 0;
                }
            }
        }
    });

    if (!onGround) {
        player.isJumping = true;
    }

    // Player-Enemy collisions
    enemies.forEach(enemy => {
        if (player.x + player.width > enemy.x &&
            player.x < enemy.x + enemy.width &&
            player.y + player.height > enemy.y &&
            player.y < enemy.y + enemy.height) {

            // Check if player is jumping on enemy
            if (player.velocityY > 0 && player.y + player.height < enemy.y + enemy.height / 2) {
                // Remove enemy (or implement proper enemy defeat logic)
                const index = enemies.indexOf(enemy);
                if (index > -1) {
                    enemies.splice(index, 1);
                }

                // Bounce player
                player.velocityY = JUMP_FORCE / 1.5;

                // Add score for defeating enemy
                score += 20;
            } else if (!player.invulnerable) {
                // Player gets hit
                playerTakeDamage(ENEMY_DAMAGE);
            }
        }
    });

    // Player-Coin collisions
    coins.forEach(coin => {
        if (!coin.collected &&
            player.x + player.width > coin.x &&
            player.x < coin.x + coin.width &&
            player.y + player.height > coin.y &&
            player.y < coin.y + coin.height) {

            coin.collected = true;
            score += COIN_SCORE;
            playSound('coin');
        }
    });
}

// Player takes damage
function playerTakeDamage(damage) {
    player.health -= damage;
    player.invulnerable = true;
    player.invulnerableTimer = 0;
    playSound('damage');

    if (player.health <= 0) {
        player.lives--;
        if (player.lives <= 0) {
            gameOver = true;
            playSound('gameOver');
        } else {
            resetPlayer();
        }
    }
}

// Reset player after getting hit
function resetPlayer() {
    player.x = 100;
    player.y = 300;
    player.velocityX = 0;
    player.velocityY = 0;
    player.health = MAX_HEALTH;
}

// Render game objects
function render() {
    // Draw background
    ctx.fillStyle = '#5c94fc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    ctx.fillStyle = '#8b4513';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw coins
    ctx.fillStyle = '#ffd700';
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.beginPath();
            ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw enemies - back to simple drawing
    ctx.fillStyle = '#ff0000';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // Add eyes to make it look like an enemy
        ctx.fillStyle = '#fff';
        ctx.fillRect(enemy.x + 8, enemy.y + 8, 4, 4);
        ctx.fillRect(enemy.x + 20, enemy.y + 8, 4, 4);

        // Add angry eyebrows
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(enemy.x + 6, enemy.y + 6);
        ctx.lineTo(enemy.x + 12, enemy.y + 10);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(enemy.x + 26, enemy.y + 6);
        ctx.lineTo(enemy.x + 20, enemy.y + 10);
        ctx.stroke();
    });

    // Draw player - back to simple drawing
    if (player.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
        // Blinking effect when invulnerable
        ctx.globalAlpha = 0.5;
    }

    if (player.characterType === 'pepe') {
        // Draw Pepe-style character
        ctx.fillStyle = '#77b255'; // Pepe green
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Draw Pepe face details
        ctx.fillStyle = '#000';
        // Eyes
        ctx.fillRect(player.x + 8, player.y + 8, 4, 4);
        ctx.fillRect(player.x + 20, player.y + 8, 4, 4);
        // Mouth
        ctx.beginPath();
        ctx.arc(player.x + 16, player.y + 20, 8, 0, Math.PI, false);
        ctx.stroke();
    } else {
        // Draw human-like character
        ctx.fillStyle = '#FFC0CB'; // Pink skin tone
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Draw face
        ctx.fillStyle = '#000';
        // Eyes
        ctx.fillRect(player.x + 8, player.y + 8, 4, 4);
        ctx.fillRect(player.x + 20, player.y + 8, 4, 4);
        // Mouth
        ctx.beginPath();
        ctx.arc(player.x + 16, player.y + 20, 5, 0, Math.PI, false);
        ctx.stroke();
    }

    ctx.globalAlpha = 1.0;

    // Render UI elements
    renderUI();
}

// Render UI elements
function renderUI() {
    // Health bar
    // Border
    ctx.fillStyle = '#000';
    ctx.fillRect(
        healthBar.x - healthBar.borderWidth,
        healthBar.y - healthBar.borderWidth,
        healthBar.width + healthBar.borderWidth * 2,
        healthBar.height + healthBar.borderWidth * 2
    );

    // Background
    ctx.fillStyle = '#fff';
    ctx.fillRect(healthBar.x, healthBar.y, healthBar.width, healthBar.height);

    // Health amount
    const healthWidth = (player.health / MAX_HEALTH) * healthBar.width;
    ctx.fillStyle = player.health > 30 ? '#0f0' : '#f00';
    ctx.fillRect(healthBar.x, healthBar.y, healthWidth, healthBar.height);

    // Health text
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.fillText(`HP: ${player.health}/${MAX_HEALTH}`, healthBar.x + 5, healthBar.y + 12);

    // Lives
    ctx.fillStyle = '#f00';
    ctx.font = '16px Arial';
    ctx.fillText(`Lives: ${player.lives}`, livesDisplay.x, livesDisplay.y);

    // Level
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.fillText(`Level: ${currentLevel}`, levelDisplay.x, levelDisplay.y);

    // Score
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${score}`, scoreDisplay.x, scoreDisplay.y);
}

// Render game over screen
function renderGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);

    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);

    ctx.font = '18px Arial';
    ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 50);

    // Reset text alignment
    ctx.textAlign = 'left';

    // Check for restart
    if (keys['KeyR']) {
        restartGame();
    }
}

// Check if level is complete
function checkLevelComplete() {
    const allCoinsCollected = coins.every(coin => coin.collected);

    if (allCoinsCollected) {
        playSound('levelComplete');
        currentLevel++;
        loadNextLevel();
    }
}

// Load next level
function loadNextLevel() {
    // Reset player position
    player.x = 100;
    player.y = 300;
    player.velocityX = 0;
    player.velocityY = 0;

    // Clear existing game objects
    platforms = [];
    enemies = [];
    coins = [];

    // Add ground platform
    platforms.push({
        x: 0,
        y: 450,
        width: 800,
        height: 30
    });

    // Add more platforms based on level
    const platformCount = 3 + currentLevel;
    for (let i = 0; i < platformCount; i++) {
        platforms.push({
            x: Math.random() * (canvas.width - 100),
            y: 150 + Math.random() * 250,
            width: 70 + Math.random() * 100,
            height: 20
        });
    }

    // Add more enemies based on level
    const enemyCount = currentLevel;
    for (let i = 0; i < enemyCount; i++) {
        enemies.push({
            x: 100 + Math.random() * (canvas.width - 200),
            y: 418,
            width: 32,
            height: 32,
            velocityX: 1 + Math.random() * currentLevel,
            direction: Math.random() > 0.5 ? 'right' : 'left',
            frame: 0,
            frameCount: 2,
            frameDelay: 10,
            frameTimer: 0
        });
    }

    // Add coins based on level, ensuring they don't overlap with platforms
    const coinCount = 5 + currentLevel;
    for (let i = 0; i < coinCount; i++) {
        let validPosition = false;
        let coinX, coinY;

        // Try to find a valid position that doesn't overlap with platforms
        let attempts = 0;
        while (!validPosition && attempts < 50) {
            coinX = Math.random() * (canvas.width - 50);
            coinY = 100 + Math.random() * 300;
            validPosition = true;

            // Check if this position overlaps with any platform
            for (const platform of platforms) {
                if (coinX + 16 > platform.x &&
                    coinX < platform.x + platform.width &&
                    coinY + 16 > platform.y &&
                    coinY < platform.y + platform.height) {
                    validPosition = false;
                    break;
                }
            }
            attempts++;
        }

        // Add the coin at the valid position or at a default position if no valid one was found
        coins.push({
            x: validPosition ? coinX : 50 + i * 50,
            y: validPosition ? coinY : 100,
            width: 16,
            height: 16,
            frame: 0,
            frameCount: 4,
            frameDelay: 8,
            frameTimer: 0,
            collected: false
        });
    }
}

// Restart game
function restartGame() {
    gameOver = false;
    currentLevel = 1;
    score = 0;
    player.lives = INITIAL_LIVES;
    player.health = MAX_HEALTH;

    // Reset game objects
    setupGame();
}

// Quit game function
function quitGame() {
    if (gameStarted && !gameOver) {
        // Stop all sounds
        stopSound('backgroundMusic');

        // Show confirmation dialog
        if (confirm('Are you sure you want to quit the game?')) {
            // Reset game state
            gameStarted = false;
            gameRunning = false;

            // Show main menu or other appropriate UI
            document.getElementById('startScreen').style.display = 'block';

            console.log('Game quit by user');
        } else {
            // Resume game if user cancels
            if (!sounds.backgroundMusic.paused) {
                playSound('backgroundMusic');
            }
        }
    }
}

// Toggle sound
function toggleSound() {
    toggleMute();
}

// Initialize the game when the window loads
window.onload = init;