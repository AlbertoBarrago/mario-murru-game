/**
 * Represents a coin in the game
 * @class
 */
export default class Coin {
  /**
     * Creates a new coin instance
     * @param {number} x - The x-coordinate of the coin
     * @param {number} y - The y-coordinate of the coin
     */
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 16;
    this.frame = 0;
    this.frameCount = 4;
    this.frameDelay = 8;
    this.frameTimer = 0;
    this.collected = false;
  }

  /**
     * Updates the coin's animation state
     */
  update() {
    if (!this.collected) {
      this.frameTimer++;
      if (this.frameTimer > this.frameDelay) {
        this.frame = (this.frame + 1) % this.frameCount;
        this.frameTimer = 0;
      }
    }
  }

  /**
     * Renders the coin on the canvas
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
  render(ctx) {
    if (!this.collected) {
      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}