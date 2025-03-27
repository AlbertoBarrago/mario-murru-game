export default class Enemy {
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

    update(canvasWidth) {
        // Move enemy
        this.x += this.velocityX;

        // Boundary checks and direction change
        if (this.x <= 0 || this.x + this.width >= canvasWidth) {
            this.velocityX *= -1;
            this.direction = this.velocityX > 0 ? 'right' : 'left';
        }

        // Animation
        this.frameTimer++;
        if (this.frameTimer > this.frameDelay) {
            this.frame = (this.frame + 1) % this.frameCount;
            this.frameTimer = 0;
        }
    }

    render(ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Add eyes to make it look like an enemy
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x + 8, this.y + 8, 4, 4);
        ctx.fillRect(this.x + 20, this.y + 8, 4, 4);

        // Add angry eyebrows
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