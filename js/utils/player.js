import { GRAVITY, JUMP_FORCE, MOVEMENT_SPEED, FRICTION, MAX_HEALTH } from '../constants.js';
import { playSound } from './sound.js';

/**
 * Represents a player character in the game
 * @class
 */
export default class Player {
    /**
     * Creates a new Player instance
     * @param {number} x - Initial x coordinate
     * @param {number} y - Initial y coordinate
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.direction = 'right';
        this.frame = 0;
        this.frameCount = 3;
        this.frameDelay = 5;
        this.frameTimer = 0;
        this.health = MAX_HEALTH;
        this.lives = 3;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.invulnerableDuration = 60;
        this.characterType = 'pepe';
    }

    /**
     * Updates the player's state based on input and game physics
     * @param {Object} keys - Current keyboard state
     * @param {number} canvasWidth - Width of the game canvas
     * @param {number} canvasHeight - Height of the game canvas
     */
    update(keys, canvasWidth, canvasHeight) {
        if (keys['ArrowLeft'] || keys['KeyA']) {
            this.velocityX = -MOVEMENT_SPEED;
            this.direction = 'left';
            this.frameTimer++;
        } else if (keys['ArrowRight'] || keys['KeyD']) {
            this.velocityX = MOVEMENT_SPEED;
            this.direction = 'right';
            this.frameTimer++;
        } else {
            this.velocityX *= FRICTION;
            this.frameTimer = 0;
            this.frame = 0;
        }

        if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && !this.isJumping) {
            this.velocityY = JUMP_FORCE;
            this.isJumping = true;
            playSound('jump');
        }

        this.velocityY += GRAVITY;

        if (this.velocityY > 15) {
            this.velocityY = 15;
        }

        this.x += this.velocityX;
        this.y += this.velocityY;

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;

        if (this.y + this.height > canvasHeight) {
            this.y = canvasHeight - this.height;
            this.velocityY = 0;
            this.isJumping = false;
        }

        if (this.frameTimer > this.frameDelay) {
            this.frame = (this.frame + 1) % this.frameCount;
            this.frameTimer = 0;
        }

        if (this.invulnerable) {
            this.invulnerableTimer++;
            if (this.invulnerableTimer >= this.invulnerableDuration) {
                this.invulnerable = false;
                this.invulnerableTimer = 0;
            }
        }
    }

    /**
     * Renders the player character on the canvas
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    render(ctx) {
        if (this.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        if (this.characterType === 'pepe') {
            ctx.fillStyle = '#77b255';
            ctx.fillRect(this.x, this.y, this.width, this.height);

            ctx.fillStyle = '#000';
            ctx.fillRect(this.x + 8, this.y + 8, 4, 4);
            ctx.fillRect(this.x + 20, this.y + 8, 4, 4);
            ctx.beginPath();
            ctx.arc(this.x + 16, this.y + 20, 8, 0, Math.PI, false);
            ctx.stroke();
        } else {
            ctx.fillStyle = '#FFC0CB';
            ctx.fillRect(this.x, this.y, this.width, this.height);

            ctx.fillStyle = '#000';
            ctx.fillRect(this.x + 8, this.y + 8, 4, 4);
            ctx.fillRect(this.x + 20, this.y + 8, 4, 4);
            ctx.beginPath();
            ctx.arc(this.x + 16, this.y + 20, 5, 0, Math.PI, false);
            ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
    }

    /**
     * Applies damage to the player and triggers invulnerability
     * @param {number} damage - Amount of damage to apply
     * @returns {boolean} - Whether the player's health has reached zero
     */
    takeDamage(damage) {
        this.health -= damage;
        this.invulnerable = true;
        this.invulnerableTimer = 0;
        playSound('damage');
        return this.health <= 0;
    }

    /**
     * Resets the player's position and state
     * @param {number} x - New x coordinate
     * @param {number} y - New y coordinate
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.health = MAX_HEALTH;
    }
}