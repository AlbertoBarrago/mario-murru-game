import { GRAVITY, JUMP_FORCE, MOVEMENT_SPEED, FRICTION, MAX_HEALTH } from '../constants.js';
import { playSound } from './sound.js';

export default class Player {
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
        this.characterType = 'pepe'; // 'human' or 'pepe'
    }

    update(keys, canvasWidth, canvasHeight) {
        // Handle input
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

        // Handle jumping
        if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && !this.isJumping) {
            this.velocityY = JUMP_FORCE;
            this.isJumping = true;
            playSound('jump');
        }

        // Apply gravity
        this.velocityY += GRAVITY;

        // Limit falling speed to prevent tunneling through platforms
        if (this.velocityY > 15) {
            this.velocityY = 15;
        }

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Boundary checks
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;

        // Add bottom boundary check to prevent falling through the canvas
        if (this.y + this.height > canvasHeight) {
            this.y = canvasHeight - this.height;
            this.velocityY = 0;
            this.isJumping = false;
        }

        // Animation
        if (this.frameTimer > this.frameDelay) {
            this.frame = (this.frame + 1) % this.frameCount;
            this.frameTimer = 0;
        }

        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerableTimer++;
            if (this.invulnerableTimer >= this.invulnerableDuration) {
                this.invulnerable = false;
                this.invulnerableTimer = 0;
            }
        }
    }

    render(ctx) {
        if (this.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
            // Blinking effect when invulnerable
            ctx.globalAlpha = 0.5;
        }

        if (this.characterType === 'pepe') {
            // Draw Pepe-style character
            ctx.fillStyle = '#77b255'; // Pepe green
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Draw Pepe face details
            ctx.fillStyle = '#000';
            // Eyes
            ctx.fillRect(this.x + 8, this.y + 8, 4, 4);
            ctx.fillRect(this.x + 20, this.y + 8, 4, 4);
            // Mouth
            ctx.beginPath();
            ctx.arc(this.x + 16, this.y + 20, 8, 0, Math.PI, false);
            ctx.stroke();
        } else {
            // Draw human-like character
            ctx.fillStyle = '#FFC0CB'; // Pink skin tone
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Draw face
            ctx.fillStyle = '#000';
            // Eyes
            ctx.fillRect(this.x + 8, this.y + 8, 4, 4);
            ctx.fillRect(this.x + 20, this.y + 8, 4, 4);
            // Mouth
            ctx.beginPath();
            ctx.arc(this.x + 16, this.y + 20, 5, 0, Math.PI, false);
            ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
    }

    takeDamage(damage) {
        this.health -= damage;
        this.invulnerable = true;
        this.invulnerableTimer = 0;
        playSound('damage');
        return this.health <= 0;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.health = MAX_HEALTH;
    }
}