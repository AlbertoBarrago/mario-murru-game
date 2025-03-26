// Player module
import { GRAVITY, JUMP_FORCE, MOVEMENT_SPEED, FRICTION, MAX_HEALTH, INITIAL_LIVES } from './constants.js';

// Player object
let player;

// Create player
function createPlayer() {
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
        characterType: 'pepe'
    };

    return player;
}

// Update player
function updatePlayer(keys, canvas) {
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
    }

    // Apply gravity
    player.velocityY += GRAVITY;

    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Boundary checks
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Animation
    if (player.frameTimer > player.frameDelay) {
        player.frame = (player.frame + 1) % player.frameCount;
        player.frameTimer = 0;
    }

    // Update player invulnerability
    if (player.invulnerable) {
        player.invulnerableTimer++;
        if (player.invulnerableTimer >= player.invulnerableDuration) {
            player.invulnerable = false;
            player.invulnerableTimer = 0;
        }
    }
}

// Player takes damage
function playerTakeDamage(damage) {
    player.health -= damage;
    player.invulnerable = true;
    player.invulnerableTimer = 0;

    if (player.health <= 0) {
        player.lives--;
        if (player.lives <= 0) {
            return true; // Game over
        } else {
            resetPlayer();
        }
    }
    return false;
}

// Reset player after getting hit
function resetPlayer() {
    player.x = 100;
    player.y = 300;
    player.velocityX = 0;
    player.velocityY = 0;
    player.health = MAX_HEALTH;
}

// Toggle player character type
function toggleCharacterType() {
    player.characterType = player.characterType === 'pepe' ? 'human' : 'pepe';
}

export { player, createPlayer, updatePlayer, playerTakeDamage, resetPlayer, toggleCharacterType };