export default class Coin {
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

    update() {
        if (!this.collected) {
            // Animation
            this.frameTimer++;
            if (this.frameTimer > this.frameDelay) {
                this.frame = (this.frame + 1) % this.frameCount;
                this.frameTimer = 0;
            }
        }
    }

    render(ctx) {
        if (!this.collected) {
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}