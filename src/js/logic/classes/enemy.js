/**
 * Represents an enemy character in the game
 */
import { assets } from "../../assets";

export default class Enemy {
  /**
     * Creates a new Enemy instance
     * @param {number} x - The initial x coordinate
     * @param {number} y - The initial y coordinate
     * @param {number} width - The width of the enemy
     * @param {number} height - The height of the enemy
     * @param {number} speed - The speed of the enemy
     * @param {number} type - The type of the enemy (0: Goomba, 1: Koopa, 2: Ghost)
     */
  constructor(x, y, width, height, speed, type = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.direction = 1;
    this.type = type; // 0: Goomba, 1: Koopa, 2: Ghost
    this.animationFrame = 0;
    this.frameCount = 0;
    this.isPaused = false;
  }

  /**
   * Pauses the enemy's movement and animation
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resumes the enemy's movement and animation
   */
  resume() {
    this.isPaused = false;
    if (this.savedVelocity !== null) {
      this.velocityX = this.savedVelocity;
      this.savedVelocity = null;
    }
  }

  /**
     * Updates the enemy's position and animation state
     * @param {number} canvasWidth - The width of the game canvas
     */
  update(canvasWidth) {
    if (this.isPaused) return;

    this.x += this.speed * this.direction;

    // Boundary check
    if (this.x <= 0 || this.x + this.width >= canvasWidth) {
      this.direction *= -1;
    }

    // Animation
    this.frameCount++;
    if (this.frameCount >= 10) { // Change animation every 10 frames
      this.animationFrame = this.animationFrame === 0 ? 1 : 0;
      this.frameCount = 0;
    }
  }

  /**
     * Renders the enemy on the canvas
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
  render(ctx) {
    const enemySprite = assets.images["enemies_sprite"];
    if (enemySprite) {
      // Calculate the source x position based on enemy type and animation frame
      // Each enemy type has 2 frames (idle and walking/fading)
      const sourceX = (this.type * 64) + (this.animationFrame * 32);
      const sourceY = 0;

      ctx.drawImage(
        enemySprite,
        sourceX, sourceY, 32, 32, // Source coordinates from sprite sheet
        this.x, this.y, this.width, this.height // Destination coordinates on canvas
      );
    } else {
      // Fallback rendering
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}