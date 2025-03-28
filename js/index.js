// Import modules
import '../css/style.css';
import { COIN_SCORE, ENEMY_DAMAGE, INITIAL_LIVES, JUMP_FORCE } from './constants';
import { checkAssetsLoaded, loadAssets } from './assets';
import { initSounds, playSound, sounds, stopSound, toggleMute } from './core/classes/sound.js';
import { Coin, Enemy, ParticleSystem, Player } from './core';
/**
 * @typedef {Object} GameState
 * @property {boolean} loaded - Whether game assets are loaded
 * @property {boolean} started - Whether game has started
 * @property {number} currentLevel - Current game level
 * @property {number} score - Player's score
 * @property {boolean} gameOver - Whether game is over
 */

/** @type {boolean} - Whether game assets are loaded */
let gameLoaded = false;
/** @type {boolean} - Whether game has started */
let gameStarted = false;
/** @type {number} - Current game level */
let currentLevel = 1;
/** @type {number} - Player's score */
let score = 0;
/** @type {boolean} - Whether game is over */
let gameOver = false;
/** @type {boolean} - Whether game is paused */
let gamePaused = false;
/** @type {boolean} - Whether pause transition is in progress */
let pauseTransitioning = false;
/** @type {number} - Timestamp when pause state last changed */
let lastPauseChange = 0;

/**
 * @typedef {Object} Assets
 * @property {Object.<string, HTMLImageElement>} images - Game images
 * @property {Object.<string, HTMLAudioElement>} sounds - Game sounds
 * @property {number} loaded - Number of assets loaded
 * @property {number} total - Total number of assets to load
 */

/** @type {Player} - Player object */
let player;
/** @type {Array<Object>} - Array of platform objects */
let platforms = [];
/** @type {Array<Enemy>} - Array of enemy objects */
let enemies = [];
/** @type {Array<Coin>} - Array of coin objects */
let coins = [];
/** @type {ParticleSystem} - Particle system for visual effects */
let particleSystem;

/** @type {HTMLCanvasElement} - Game canvas */
const canvas = document.getElementById('gameCanvas');
/** @type {CanvasRenderingContext2D} - Canvas rendering context */
const ctx = canvas.getContext('2d');

/**
 * @typedef {Object} UIElement
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} [width] - Width of element
 * @property {number} [height] - Height of element
 * @property {number} [borderWidth] - Border width
 * @property {number} [spacing] - Spacing between elements
 */

/** @type {UIElement} - Health bar UI element */
let healthBar = {
  x: 20,
  y: 15,
  width: 150,
  height: 15,
  borderWidth: 2
};

/** @type {UIElement} - Lives display UI element */
let livesDisplay = {
  x: 20,
  y: 60,
  spacing: 25
};

/** @type {UIElement} - Level display UI element */
let levelDisplay = {
  x: canvas.width - 100,
  y: 30
};

/** @type {UIElement} - Score display UI element */
let scoreDisplay = {
  x: canvas.width - 100,
  y: 60
};

/** @type {Object.<string, boolean>} - Keyboard input state */
const keys = {};

/**
 * Initialize the game
 * @function init
 */
/**
 * Start the game
 * @function startGame
 */
function startGame() {
  if (!gameLoaded) return;
  gameStarted = true;
  window.gameStarted = true;
  window.gameRunning = true;
  gamePaused = false;
  window.gamePaused = false;
  playSound('backgroundMusic');
}

function init() {
  initSounds();
  loadAssets();

  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;

    if (e.code === 'KeyM') {
      toggleMute();
    }

    if (e.code === 'KeyQ') {
      quitGame();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Enter' && !gameStarted) {
      startGame();
    }
    if (e.code === 'KeyP' && gameStarted && !pauseTransitioning) {
      const now = Date.now();
      if (now - lastPauseChange > 300) { // Prevent rapid pause toggling
        pauseTransitioning = true;
        gamePaused = !gamePaused;
        window.gamePaused = gamePaused;
        lastPauseChange = now;

        if (gamePaused) {
          sounds.backgroundMusic.pause();
          player.pauseAnimation();
          enemies.forEach(enemy => enemy.pause());
          particleSystem.pause();
        } else {
          sounds.backgroundMusic.play().catch(error => {
            console.warn('Failed to resume background music:', error);
          });
          player.resumeAnimation();
          enemies.forEach(enemy => enemy.resume());
          particleSystem.resume();
        }

        setTimeout(() => {
          pauseTransitioning = false;
        }, 100);
      }
    }
  });

  window.gameStarted = false;
  window.gameRunning = false;

  checkAssetsLoaded(
    () => {
      gameLoaded = true;
      setupGame();
      requestAnimationFrame(gameLoop);
    }
  );
}

/**
 * Set up game objects
 * @function setupGame
 */
function setupGame() {
  player = new Player(100, 300);
  player.lives = INITIAL_LIVES;
  particleSystem = new ParticleSystem();

  // Ground
  platforms.push({
    x: 0,
    y: 450,
    width: 800,
    height: 30
  });

  // Platforms
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

  enemies.push(new Enemy(300, 418, 32, 32, 2));

  for (let i = 0; i < 5; i++) {
    coins.push(new Coin(150 + i * 120, 300));
  }
}

/**
 * Main game loop
 * @function gameLoop
 */
function gameLoop() {
  if (!gameLoaded) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Synchronize game state with window object
  gameStarted = window.gameStarted;
  gameRunning = window.gameRunning;

  if (!gameStarted) {
    render();
  } else if (gameOver) {
    renderGameOver();
  } else {
    if (!gamePaused) {
      if (sounds.backgroundMusic.paused) {
        playSound('backgroundMusic');
      }
      update();
      checkLevelComplete();
    }

    render();
    if (gamePaused) {
      drawPauseOverlay();
    }
  }

  requestAnimationFrame(gameLoop);
}

/**
 * Pause the game
 */
function drawPauseOverlay() {
  // Create gradient overlay
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw pause menu box
  const menuWidth = 300;
  const menuHeight = 200;
  const menuX = (canvas.width - menuWidth) / 2;
  const menuY = (canvas.height - menuHeight) / 2;

  // Menu background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);

  // Pause text with shadow
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', canvas.width / 2, menuY + 60);

  // Instructions
  ctx.font = '18px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText('Press P to Resume', canvas.width / 2, menuY + 100);
  ctx.fillText('Press Q to Quit', canvas.width / 2, menuY + 130);

  // Current score
  ctx.font = '16px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText(`Score: ${score}`, canvas.width / 2, menuY + 160);
}

/**
 * Update game state
 * @function update
 */
function update() {
  player.update(keys, canvas.width, canvas.height);
  enemies.forEach(enemy => enemy.update(canvas.width));
  coins.forEach(coin => coin.update());
  particleSystem.update();
  checkCollisions();
}

/**
 * Check for collisions between game objects
 * @function checkCollisions
 */
function checkCollisions() {
  let onGround = false;

  platforms.forEach(platform => {
    const overlapX = Math.min(player.x + player.width, platform.x + platform.width) -
            Math.max(player.x, platform.x);
    const overlapY = Math.min(player.y + player.height, platform.y + platform.height) -
            Math.max(player.y, platform.y);

    if (overlapX > 0 && overlapY > 0) {
      if (overlapX < overlapY) {
        if (player.x < platform.x) {
          player.x = platform.x - player.width;
        } else {
          player.x = platform.x + platform.width;
        }
        player.velocityX = 0;
      } else {
        if (player.y < platform.y) {
          player.y = platform.y - player.height;
          player.velocityY = 0;
          player.isJumping = false;
          onGround = true;
        } else {
          player.y = platform.y + platform.height;
          player.velocityY = 0;
        }
      }
    }
  });

  if (!onGround) {
    player.isJumping = true;
  }

  enemies.forEach((enemy, index) => {
    if (player.x + player.width > enemy.x &&
            player.x < enemy.x + enemy.width &&
            player.y + player.height > enemy.y &&
            player.y < enemy.y + enemy.height) {

      if (player.velocityY > 0 && player.y + player.height < enemy.y + enemy.height / 2) {
        // Create explosion effect at enemy position
        particleSystem.createExplosion(
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height / 2,
          30,
          ['#ff0000', '#ff7700', '#ffff00', '#ff00ff']
        );

        // Create score popup
        particleSystem.createScorePopup(enemy.x + enemy.width / 2, enemy.y, 20);

        // Remove enemy
        enemies.splice(index, 1);
        player.velocityY = JUMP_FORCE / 1.5;
        score += 20;

        // Play sound effect
        playSound('damage');
      } else if (!player.invulnerable) {
        const healthDepleted = player.takeDamage(ENEMY_DAMAGE);
        if (healthDepleted) {
          player.lives--;
          if (player.lives <= 0) {
            gameOver = true;
            playSound('gameOver');
          } else {
            player.reset(100, 300);
          }
        }
      }
    }
  });

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

/**
 * Render game objects
 * @function render
 */
function render() {
  ctx.fillStyle = '#5c94fc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#8b4513';
  platforms.forEach(platform => {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
  });

  coins.forEach(coin => coin.render(ctx));
  enemies.forEach(enemy => enemy.render(ctx));
  player.render(ctx);
  particleSystem.render(ctx);

  renderUI();
}

/**
 * Render UI elements
 * @function renderUI
 */
function renderUI() {
  // Health bar border
  ctx.fillStyle = '#000';
  ctx.fillRect(
    healthBar.x - healthBar.borderWidth,
    healthBar.y - healthBar.borderWidth,
    healthBar.width + healthBar.borderWidth * 2,
    healthBar.height + healthBar.borderWidth * 2
  );

  // Health bar background
  ctx.fillStyle = '#fff';
  ctx.fillRect(healthBar.x, healthBar.y, healthBar.width, healthBar.height);

  // Health amount
  const healthWidth = (player.health / 100) * healthBar.width;
  ctx.fillStyle = player.health > 30 ? '#0f0' : '#f00';
  ctx.fillRect(healthBar.x, healthBar.y, healthWidth, healthBar.height);

  // Health text
  ctx.fillStyle = '#000';
  ctx.font = '12px Arial';
  ctx.fillText(`HP: ${player.health}/100`, healthBar.x + 5, healthBar.y + 12);

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

/**
 * Render game over screen
 * @function renderGameOver
 */
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

  ctx.textAlign = 'left';

  if (keys['KeyR']) {
    restartGame();
  }
}

/**
 * Check if the level is complete
 * @function checkLevelComplete
 */
function checkLevelComplete() {
  const allCoinsCollected = coins.every(coin => coin.collected);

  if (allCoinsCollected) {
    playSound('levelComplete');
    currentLevel++;
    loadNextLevel();
  }
}

/**
 * Load next level
 * @function loadNextLevel
 */
function loadNextLevel() {
  player.reset(100, 300);

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
  for (let i = 0; i < currentLevel; i++) {
    const speed = 1 + Math.random() * currentLevel;
    enemies.push(new Enemy(
      100 + Math.random() * (canvas.width - 200),
      418,
      32,
      32,
      speed
    ));
  }

  // Add coins based on level
  const coinCount = 5 + currentLevel;
  for (let i = 0; i < coinCount; i++) {
    let validPosition = false;
    let coinX, coinY;

    let attempts = 0;
    while (!validPosition && attempts < 50) {
      coinX = Math.random() * (canvas.width - 50);
      coinY = 100 + Math.random() * 300;
      validPosition = true;

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

    coins.push(new Coin(
      validPosition ? coinX : 50 + i * 50,
      validPosition ? coinY : 100
    ));
  }
}

/**
 * Restart the game
 * @function restartGame
 */
function restartGame() {
  gameOver = false;
  currentLevel = 1;
  score = 0;
  setupGame();
}

/**
 * Quit the game
 * @function quitGame
 */
function quitGame() {
  if (gameStarted && !gameOver) {
    stopSound('backgroundMusic');

    if (confirm('Are you sure you want to quit the game?')) {
      window.gameStarted = false;
      window.gameRunning = false;
      document.getElementById('startScreen').style.display = 'block';
      console.warn('Game quit by user');
    } else {
      if (!sounds.backgroundMusic.paused) {
        playSound('backgroundMusic');
      }
    }
  }
}

// Initialize the game when the window loads
window.onload = init;