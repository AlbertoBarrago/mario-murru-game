// Import modules
import '../css/style.css';
import { checkAssetsLoaded, loadAssets } from './assets';
import { initSounds, toggleMute } from './core/classes/sound.js';
import {
  initGameState,
  getGameState,
  startGame,
  setupGame,
  update,
  render,
  togglePause,
  restartGame,
  quitGame
} from './core/services/game.js';

const canvas = document.getElementById('gameCanvas');
if (!canvas) {
  console.error('Canvas element not found!');
}

const gameState = initGameState(canvas);

/**
 * Initialize the game
 */
function init() {
  try {
    initSounds();
  } catch (error) {
    console.error('Failed to initialize sounds:', error);
  }

  setupEventListeners();

  loadAssets();
  checkAssetsLoaded(() => {
    gameState.loaded = true;
    setupGame();
    requestAnimationFrame(gameLoop);
  });
}

/**
 * Set up event listeners for keyboard input
 */
function setupEventListeners() {
  window.addEventListener('keydown', (e) => {
    gameState.keys[e.code] = true;

    if (e.code === 'KeyM') {
      toggleMute();
    }

    if (e.code === 'Enter' && !gameState.started) {
      const startScreen = document.getElementById('startScreen');
      if (startScreen) {
        startScreen.style.display = 'none';
      }
      startGame();
    }

    if (e.code === 'KeyP' && gameState.started) {
      togglePause();
    }

    if (e.code === 'KeyQ' && gameState.started && !gameState.over) {
      quitGame();
    }

    if (e.code === 'KeyR' && gameState.over) {
      restartGame();
    }
  });

  window.addEventListener('keyup', (e) => {
    gameState.keys[e.code] = false;
  });
}

/**
 * Main game loop
 */
function gameLoop() {
  const state = getGameState();

  if (!state.loaded) {
    requestAnimationFrame(gameLoop);
    return;
  }

  // Synchronize game state with window object if needed
  state.started = window.gameStarted || state.started;
  state.running = window.gameRunning || state.running;

  if (!state.started) {
    render();
  } else if (state.over) {
    renderGameOver();
  } else {
    update();
    render();
  }

  requestAnimationFrame(gameLoop);
}

/**
 * Render game over screen
 */
function renderGameOver() {
  const { ctx, canvas, score, keys } = gameState;

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

window.onload = init;
