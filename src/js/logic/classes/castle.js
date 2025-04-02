/**
 * Represents the castle in the final level
 */
import { assets } from '../../assets';

export default class Castle {
  /**
     * Creates a new Castle instance
     * @param {number} x - The initial x coordinate
     * @param {number} y - The initial y coordinate
     */
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 96;  // Increased castle size
    this.height = 96;
    this.barriers = [
      { x: x - 32, y: y + 32, width: 32, height: 8 }, // Left barrier
      { x: x + this.width, y: y + 32, width: 32, height: 8 }, // Right barrier
      { x: x - 32, y: y - 16, width: 8, height: 48 }, // Left vertical barrier
      { x: x + this.width + 24, y: y - 16, width: 8, height: 48 } // Right vertical barrier
    ];
  }

  /**
     * Renders the castle on the canvas
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
  render(ctx) {
    // Render castle
    const castleSprite = assets.images['castle'];
    if (castleSprite) {
      ctx.drawImage(
        castleSprite,
        this.x, this.y, this.width, this.height
      );
    } else {
      // Fallback rendering
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Render barriers
    ctx.fillStyle = '#8B4513';
    this.barriers.forEach(barrier => {
      ctx.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
    });
  }
}