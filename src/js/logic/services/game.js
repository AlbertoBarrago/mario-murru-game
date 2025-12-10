import { playSound, sounds, stopSound } from "../classes/sound.js";
import {
  COIN_SCORE,
  ENEMY_DAMAGE,
  INITIAL_LIVES,
  JUMP_FORCE,
  LAST_LEVEL,
} from "../../constants";
import { Coin, Enemy, ParticleSystem, Player, Princess } from "../index";

const gameState = {
  loaded: false,
  started: false,
  running: false,
  paused: false,
  over: false,
  victory: false,
  currentLevel: 1,
  score: 0,
  pauseTransitioning: false,
  lastPauseChange: 0,
  player: null,
  platforms: [],
  enemies: [],
  coins: [],
  particleSystem: null,
  canvas: null,
  ctx: null,
  keys: {},
  creditsPosition: 300,
  creditsSpeed: 1.5,
  creditsPaused: false,
};

/**
 * Initialize the game state
 * @param {HTMLCanvasElement} canvas - The game canvas
 */
export function initGameState(canvas) {
  gameState.canvas = canvas;
  gameState.ctx = canvas.getContext("2d");
  return gameState;
}

/**
 * Get the current game state
 * @returns {Object} The game state
 */
export function getGameState() {
  return gameState;
}

/**
 * Start the game
 */
export function startGame(skipToFinal = false) {
  if (!gameState.loaded) return;

  // Initialize game objects FIRST
  if (!gameState.player) {
    setupGame();
  }

  gameState.started = true;
  gameState.running = true;
  gameState.paused = false;
  gameState.over = false;
  gameState.victory = false;

  // Update window properties if needed for compatibility
  if (window) {
    window.gameStarted = true;
    window.gameRunning = true;
    window.gamePaused = false;
  }

  playSound("backgroundMusic");

  // Skip to final level if requested
  if (skipToFinal) {
    gameState.currentLevel = LAST_LEVEL;
    loadNextLevel();
  }
}

export function restartGame() {
  // Stop music first
  stopSound("backgroundMusic");

  // Reset all game state variables
  gameState.over = false;
  gameState.victory = false;
  gameState.paused = false;
  gameState.running = false;
  gameState.started = false;
  gameState.currentLevel = 1;
  gameState.score = 0;

  // Clear arrays
  gameState.platforms = [];
  gameState.enemies = [];
  gameState.coins = [];
  gameState.princess = null;

  // Reinitialize game
  setupGame();

  // Restart the game
  gameState.started = true;
  gameState.running = true;
  playSound("backgroundMusic");
}

/**
 * Set up game objects
 */
export function setupGame() {
  gameState.player = new Player(100, 300);
  gameState.player.lives = INITIAL_LIVES;
  gameState.particleSystem = new ParticleSystem();
  gameState.platforms = [];
  gameState.enemies = [];
  gameState.coins = [];
  gameState.score = 0;
  gameState.currentLevel = 1;
  gameState.over = false;

  // Ground
  gameState.platforms.push({
    x: 0,
    y: 450,
    width: 800,
    height: 30,
  });

  gameState.platforms.push({
    x: 200,
    y: 350,
    width: 100,
    height: 20,
  });

  gameState.platforms.push({
    x: 400,
    y: 300,
    width: 100,
    height: 20,
  });

  gameState.platforms.push({
    x: 600,
    y: 250,
    width: 100,
    height: 20,
  });

  gameState.enemies.push(new Enemy(300, 418, 32, 32, 2));

  for (let i = 0; i < LAST_LEVEL; i++) {
    gameState.coins.push(new Coin(150 + i * 120, 300));
  }
}

/**
 * Toggle pause state
 */
export function togglePause() {
  if (gameState.pauseTransitioning || !gameState.started) return;

  const now = Date.now();
  if (now - gameState.lastPauseChange <= 300) return; // Prevent rapid toggling

  gameState.pauseTransitioning = true;
  gameState.paused = !gameState.paused;
  gameState.lastPauseChange = now;
  gameState.running = !gameState.paused;

  if (window) {
    window.gamePaused = gameState.paused;
  }

  if (gameState.paused) {
    sounds.backgroundMusic.pause();
    gameState.player?.pauseAnimation();
    gameState.enemies.forEach((enemy) => enemy.pause());
    gameState.particleSystem?.pause();
  } else {
    sounds.backgroundMusic.play().catch((error) => {
      console.warn("Failed to resume background music:", error);
    });
    gameState.player?.resumeAnimation();
    gameState.enemies.forEach((enemy) => enemy.resume());
    gameState.particleSystem?.resume();
  }

  setTimeout(() => {
    gameState.pauseTransitioning = false;
  }, 100);
}

/**
 * Update game state
 */
export function update() {
  if (!gameState.running || gameState.paused || gameState.over) return;

  if (gameState.player) {
    gameState.player.update(
      gameState.keys,
      gameState.canvas.width,
      gameState.canvas.height,
    );
  }
  gameState.enemies.forEach((enemy) => enemy.update(gameState.canvas.width));
  gameState.coins.forEach((coin) => coin.update());
  if (gameState.princess) gameState.princess.update();
  if (gameState.particleSystem) {
    gameState.particleSystem.update();
  }
  checkCollisions();
  checkLevelComplete();
}

/**
 * Check for collisions between game objects
 */
export function checkCollisions() {
  let onGround = false;

  gameState.platforms.forEach((platform) => {
    const overlapX =
      Math.min(
        gameState.player.x + gameState.player.width,
        platform.x + platform.width,
      ) - Math.max(gameState.player.x, platform.x);
    const overlapY =
      Math.min(
        gameState.player.y + gameState.player.height,
        platform.y + platform.height,
      ) - Math.max(gameState.player.y, platform.y);

    if (overlapX > 0 && overlapY > 0) {
      if (overlapX < overlapY) {
        if (gameState.player.x < platform.x) {
          gameState.player.x = platform.x - gameState.player.width;
        } else {
          gameState.player.x = platform.x + platform.width;
        }
        gameState.player.velocityX = 0;
      } else {
        if (gameState.player.y < platform.y) {
          gameState.player.y = platform.y - gameState.player.height;
          gameState.player.velocityY = 0;
          gameState.player.isJumping = false;
          onGround = true;
        } else {
          gameState.player.y = platform.y + platform.height;
          gameState.player.velocityY = 0;
        }
      }
    }
  });

  if (!onGround) {
    gameState.player.isJumping = true;
  }

  // Enemy collisions
  gameState.enemies.forEach((enemy, index) => {
    if (
      gameState.player.x + gameState.player.width > enemy.x &&
      gameState.player.x < enemy.x + enemy.width &&
      gameState.player.y + gameState.player.height > enemy.y &&
      gameState.player.y < enemy.y + enemy.height
    ) {
      if (
        gameState.player.velocityY > 0 &&
        gameState.player.y + gameState.player.height - 10 <= enemy.y
      ) {
        // Create explosion effect at enemy position
        gameState.particleSystem.createExplosion(
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height / 2,
          30,
          ["#ff0000", "#ff7700", "#ffff00", "#ff00ff"],
        );

        gameState.particleSystem.createScorePopup(
          enemy.x + enemy.width / 2,
          enemy.y,
          20,
        );

        // Remove enemy
        gameState.enemies.splice(index, 1);
        gameState.player.velocityY = JUMP_FORCE / 1.5;
        gameState.score += 20;

        // Check if all enemies are defeated
        const remainingEnemies = gameState.enemies.length;
        if (remainingEnemies === 0 && gameState.princess) {
          gameState.princess.canBeReached = true;
          gameState.particleSystem.createScorePopup(
            gameState.princess.x + gameState.princess.width / 2,
            gameState.princess.y - 20,
            "Princess can now be rescued!",
            "#00ff00",
          );
        }

        // Play enemy defeat sound effect
        playSound("damage");
        playSound("coin");
      } else if (!gameState.player.invulnerable) {
        const healthDepleted = gameState.player.takeDamage(ENEMY_DAMAGE);
        if (healthDepleted) {
          gameState.player.lives--;
          if (gameState.player.lives <= 0) {
            gameState.over = true;
            playSound("gameOver");
          } else {
            gameState.player.reset(100, 300);
          }
        }
      }
    }
  });

  // Coin or princess collisions
  if (gameState.currentLevel === LAST_LEVEL) {
    // Final level - check collision with princess
    if (
      gameState.princess &&
      !gameState.princess.isReached &&
      gameState.player.x + gameState.player.width > gameState.princess.x &&
      gameState.player.x < gameState.princess.x + gameState.princess.width &&
      gameState.player.y + gameState.player.height > gameState.princess.y &&
      gameState.player.y < gameState.princess.y + gameState.princess.height
    ) {
      if (gameState.princess.canBeReached && gameState.enemies.length === 0) {
        gameState.princess.reach(gameState.particleSystem, gameState);
        playSound("gameComplete");
        // Game victory!
        gameState.victory = true;
        gameState.running = false;
        gameState.over = true;
        stopSound("backgroundMusic");
        gameState.creditsPosition = 0;
      } else {
        gameState.particleSystem.createScorePopup(
          gameState.princess.x + gameState.princess.width / 2,
          gameState.princess.y - 20,
          "Defeat all enemies first!",
          "#ff0000",
        );
      }
    }

    gameState.coins.forEach((coin) => {
      if (
        !coin.collected &&
        gameState.player.x + gameState.player.width > coin.x &&
        gameState.player.x < coin.x + coin.width &&
        gameState.player.y + gameState.player.height > coin.y &&
        gameState.player.y < coin.y + coin.height
      ) {
        coin.collected = true;
        gameState.score += COIN_SCORE;
        playSound("coin");
      }
    });
  } else {
    // Regular levels - check collision with coins
    gameState.coins.forEach((coin) => {
      if (
        !coin.collected &&
        gameState.player.x + gameState.player.width > coin.x &&
        gameState.player.x < coin.x + coin.width &&
        gameState.player.y + gameState.player.height > coin.y &&
        gameState.player.y < coin.y + coin.height
      ) {
        coin.collected = true;
        gameState.score += COIN_SCORE;
        playSound("coin");
      }
    });
  }
}

/**
 * Check if the level is complete
 */
export function checkLevelComplete() {
  const allCoinsCollected = gameState.coins.every((coin) => coin.collected);
  const allEnemiesDefeated = gameState.enemies.length === 0;

  // Advance to next level if all coins are collected OR all enemies are defeated
  if (
    (allCoinsCollected || allEnemiesDefeated) &&
    gameState.currentLevel < LAST_LEVEL
  ) {
    playSound("levelComplete");
    gameState.currentLevel++;
    loadNextLevel();
  }
}

/**
 * Load next level
 */
export function loadNextLevel() {
  gameState.player.reset(100, 300);

  // Generate platforms for the new level
  const platformCount = 3 + gameState.currentLevel;
  gameState.platforms = [];

  // Always add a ground platform
  gameState.platforms.push({
    x: 0,
    y: 450,
    width: 800,
    height: 30,
  });

  // Add additional platforms
  for (let i = 0; i < platformCount; i++) {
    const platformWidth = Math.random() * 200 + 100;
    const platformX = Math.random() * (gameState.canvas.width - platformWidth);
    const platformY = Math.random() * 250 + 150; // Keep platforms in a reasonable height range

    gameState.platforms.push({
      x: platformX,
      y: platformY,
      width: platformWidth,
      height: 20,
    });
  }

  // Aggiungi la principessa nel livello 5
  if (gameState.currentLevel === 5) {
    gameState.princess = new Princess(700, 400);
  } else {
    gameState.princess = null;
  }

  // Generate enemies - FIX: Ensure enemies are properly created
  const enemyCount = Math.min(gameState.currentLevel, 5); // Cap at 5 enemies
  gameState.enemies = [];
  for (let i = 0; i < enemyCount; i++) {
    // Place enemies on platforms - prioritize ground platform for stability
    const platformIndex =
      i === 0 ? 0 : Math.floor(Math.random() * gameState.platforms.length);
    const platform = gameState.platforms[platformIndex];

    // Create enemy with proper parameters - ensure enemy stays on platform
    const enemyWidth = 32;
    const enemyHeight = 32;
    const enemySpeed = 2;

    // Ensure enemy is placed with enough space from the edges
    const safeMargin = 20; // Safety margin to prevent falling off
    const availableWidth = platform.width - enemyWidth - safeMargin * 2;

    // Only spawn if platform is wide enough
    if (availableWidth > 0) {
      const enemyX = platform.x + safeMargin + Math.random() * availableWidth;
      const enemyY = platform.y - enemyHeight;

      const enemy = new Enemy(
        enemyX,
        enemyY,
        enemyWidth,
        enemyHeight,
        enemySpeed,
      );

      gameState.enemies.push(enemy);
    }
  }

  // Generate coins with reachability check
  const coinCount = 5 + gameState.currentLevel * 2;
  gameState.coins = [];

  // Maximum jump height calculation (approximate)
  const maxJumpHeight = 225; // Fixed value based on testing actual jump height

  for (let i = 0; i < coinCount; i++) {
    const coin = new Coin();
    let validPosition = false;
    let attempts = 0;
    const maxAttempts = 50; // Prevent infinite loops

    // Try to find a valid position for the coin
    while (!validPosition && attempts < maxAttempts) {
      attempts++;

      // Random position
      coin.x = Math.random() * (gameState.canvas.width - coin.width);
      coin.y =
        Math.random() * (gameState.canvas.height - 100 - coin.height) + 50;

      validPosition = true;

      // Check if coin is on a platform
      for (const platform of gameState.platforms) {
        if (
          coin.x + coin.width > platform.x &&
          coin.x < platform.x + platform.width &&
          coin.y + coin.height > platform.y &&
          coin.y < platform.y + platform.height
        ) {
          // Coin is inside a platform, place it above
          coin.y = platform.y - coin.height - 5;
          break;
        }
      }

      // Check if coin is reachable from any platform
      let reachable = false;
      for (const platform of gameState.platforms) {
        // Check if coin is directly above or near a platform within jump range
        if (
          coin.x + coin.width > platform.x - 30 &&
          coin.x < platform.x + platform.width + 30 &&
          coin.y > platform.y - maxJumpHeight &&
          coin.y < platform.y
        ) {
          reachable = true;
          break;
        }
      }

      // If not reachable, try again
      if (!reachable) {
        validPosition = false;
      }
    }

    // Only add the coin if we found a valid position
    if (validPosition) {
      gameState.coins.push(coin);
    }
  }
}

/**
 * Quit the game
 */
export function quitGame() {
  if (gameState.started && !gameState.over) {
    const wasPaused = gameState.paused;
    if (!wasPaused) {
      gameState.paused = true;
      if (sounds.backgroundMusic) {
        sounds.backgroundMusic.pause();
      }
    }

    // Ask for confirmation
    if (confirm("Are you sure you want to quit? Your progress will be lost.")) {
      stopSound("backgroundMusic");

      // Reset game state completely
      gameState.started = false;
      gameState.running = false;

      // Update window properties if needed
      if (window) {
        window.gameStarted = false;
        window.gameRunning = false;
      }

      // Reset score and level
      gameState.score = 0;
      gameState.currentLevel = 1;

      // Clear existing enemies and reset game
      setupGame();

      // Show the start screen again
      const startScreen = document.getElementById("startScreen");
      if (startScreen) {
        startScreen.style.display = "flex";
      }
    } else {
      if (!wasPaused) {
        gameState.paused = false;
        if (sounds.backgroundMusic) {
          sounds.backgroundMusic.play().catch((error) => {
            console.warn("Failed to resume background music:", error);
          });
        }
      }
    }
  }
}

/**
 * Render game objects
 */
export function render() {
  const { ctx, canvas } = gameState;

  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#5c94fc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#8b4513";
  gameState.platforms.forEach((platform) => {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
  });

  gameState.coins.forEach((coin) => coin.render(ctx));
  gameState.enemies.forEach((enemy) => enemy.render(ctx));
  if (gameState.princess) gameState.princess.render(ctx);

  if (gameState.player) {
    gameState.player.render(ctx);
  }

  if (gameState.particleSystem) {
    gameState.particleSystem.render(ctx);
  }

  if (gameState.player) {
    renderUI();
  }

  if (gameState.paused) {
    drawPauseOverlay();
  }
}

/**
 * Render UI elements
 */
export function renderUI() {
  const { ctx, canvas, player, currentLevel, score } = gameState;

  // Health bar configuration
  const healthBar = {
    x: 20,
    y: 15,
    width: 150,
    height: 15,
    borderWidth: 2,
  };

  // Health bar with improved styling
  // Border
  ctx.fillStyle = "#000";
  ctx.fillRect(
    healthBar.x - healthBar.borderWidth,
    healthBar.y - healthBar.borderWidth,
    healthBar.width + healthBar.borderWidth * 2,
    healthBar.height + healthBar.borderWidth * 2,
  );

  // Background
  ctx.fillStyle = "#000";
  ctx.fillRect(healthBar.x, healthBar.y, healthBar.width, healthBar.height);

  // Health amount with bright green color
  const healthWidth = (player.health / 100) * healthBar.width;
  ctx.fillStyle = "#00ff00";
  ctx.fillRect(healthBar.x, healthBar.y, healthWidth, healthBar.height);

  // Health text - centered in the bar
  ctx.fillStyle = "#fff";
  ctx.font = "10px \"Press Start 2P\"";
  ctx.textAlign = "center";
  ctx.fillText(
    `HP: ${player.health}/100`,
    healthBar.x + healthBar.width / 2,
    healthBar.y + 11,
  );
  ctx.textAlign = "left"; // Reset text alignment

  // Lives with heart icons in line with HP bar
  ctx.fillStyle = "#ff0000";
  for (let i = 0; i < player.lives; i++) {
    // Draw heart shape
    const heartX = healthBar.x + healthBar.width + 30 + i * 25;
    const heartY = healthBar.y + healthBar.height / 2 - 10;

    // Heart shape
    ctx.beginPath();
    ctx.moveTo(heartX, heartY + 5);
    ctx.bezierCurveTo(
      heartX,
      heartY,
      heartX - 5,
      heartY,
      heartX - 5,
      heartY + 5,
    );
    ctx.bezierCurveTo(
      heartX - 5,
      heartY + 10,
      heartX,
      heartY + 15,
      heartX,
      heartY + 20,
    );
    ctx.bezierCurveTo(
      heartX,
      heartY + 15,
      heartX + 5,
      heartY + 10,
      heartX + 5,
      heartY + 5,
    );
    ctx.bezierCurveTo(heartX + 5, heartY, heartX, heartY, heartX, heartY + 5);
    ctx.fill();
  }

  // Level and score on the same line
  ctx.fillStyle = "#000";
  ctx.font = "14px \"Press Start 2P\"";
  ctx.fillText(`Level: ${currentLevel}`, canvas.width - 300, healthBar.y + 11);
  ctx.fillText(`Score: ${score}`, canvas.width - 150, healthBar.y + 11);
}

/**
 * Draw the pause overlay
 */
export function drawPauseOverlay() {
  const { ctx, canvas, score } = gameState;

  // Create gradient overlay
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0.7)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.85)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw pause menu box
  const menuWidth = 300;
  const menuHeight = 200;
  const menuX = (canvas.width - menuWidth) / 2;
  const menuY = (canvas.height - menuHeight) / 2;

  // Menu background
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 2;
  ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);

  // Pause text with shadow
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = "bold 36px Arial";
  ctx.textAlign = "center";
  ctx.fillText("PAUSED", canvas.width / 2, menuY + 60);

  // Instructions
  ctx.font = "18px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.fillText("Press P to Resume", canvas.width / 2, menuY + 100);
  ctx.fillText("Press Q to Quit", canvas.width / 2, menuY + 130);

  // Current score
  ctx.font = "16px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillText(`Score: ${score}`, canvas.width / 2, menuY + 160);
}
