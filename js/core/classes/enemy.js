/**
 * Represents an enemy character in the game
 */
export default class Enemy {
  /**
     * Creates a new Enemy instance
     * @param {number} x - The initial x coordinate
     * @param {number} y - The initial y coordinate
     * @param {number} width - The width of the enemy
     * @param {number} height - The height of the enemy
     * @param {number} velocityX - The horizontal velocity
     */
  constructor(x, y, width, height, velocityX) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocityX = velocityX;
    this.direction = velocityX > 0 ? 'right' : 'left';
    this.frame = 0;
    this.frameCount = 2;
    this.frameDelay = 10;
    this.frameTimer = 0;
    this.isPaused = false;
    this.savedVelocity = null;
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
    this.x += this.velocityX;

    if (this.x <= 0 || this.x + this.width >= canvasWidth) {
      this.velocityX *= -1;
      this.direction = this.velocityX > 0 ? 'right' : 'left';
    }

    this.frameTimer++;
    if (this.frameTimer > this.frameDelay) {
      this.frame = (this.frame + 1) % this.frameCount;
      this.frameTimer = 0;
    }
  }

  /**
     * Renders the enemy on the canvas
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
  render(ctx) {
    // Determine which enemy type to use (we'll use the first type for now)
    // In a more advanced implementation, this could be a property of the enemy
    const enemyType = 0; // 0 = Goomba, 1 = Koopa, 2 = Ghost

    // Calculate which frame to use based on animation state
    // Each enemy type has 2 frames (idle and walking)
    const frameOffset = enemyType * 2; // 2 frames per enemy type
    const frameIndex = frameOffset + this.frame;

    // Calculate the classes position in the sprite sheet
    const sourceX = frameIndex * 32; // Each frame is 32px wide
    const sourceY = 0;

    // Store original velocity when paused
    if (this.isPaused && !this.savedVelocity) {
      this.savedVelocity = this.velocityX;
      this.velocityX = 0;
    }

    // Draw the sprite
    try {
      const img = new Image();
      img.src = 'assets/images/sprites/enemies.svg';
      ctx.drawImage(img, sourceX, sourceY, 32, 32, this.x, this.y, this.width, this.height);
    } catch (e) {
      // Fallback to colored rectangles if image fails to load
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(this.x, this.y, this.width, this.height);

      ctx.fillStyle = '#fff';
      ctx.fillRect(this.x + 8, this.y + 8, 4, 4);
      ctx.fillRect(this.x + 20, this.y + 8, 4, 4);

      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x + 6, this.y + 6);
      ctx.lineTo(this.x + 12, this.y + 10);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(this.x + 26, this.y + 6);
      ctx.lineTo(this.x + 20, this.y + 10);
      ctx.stroke();
      console.error('Failed to load enemy sprite:', e);
    }
  }
}