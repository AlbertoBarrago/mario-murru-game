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
    }
}