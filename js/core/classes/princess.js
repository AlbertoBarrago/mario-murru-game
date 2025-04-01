/**
 * Represents the princess character in the final level
 */
import { assets } from '../../assets';
import Castle from './castle';

export default class Princess {
    /**
     * Creates a new Princess instance
     * @param {number} x - The initial x coordinate
     * @param {number} y - The initial y coordinate
     */
    constructor(x, y) {
        this.x = x;
        this.y = y - 48; // Adjusted position for larger castle
        this.width = 32;
        this.height = 32;
        this.animationFrame = 0;
        this.frameCount = 0;
        this.isReached = false;
        this.castle = new Castle(x - 32, y - 48); // Adjusted castle position
        this.canBeReached = false; // Flag to track if all enemies are defeated
    }

    /**
     * Updates the princess's animation state
     */
    update() {
        if (this.isReached) return;

        // Animation
        this.frameCount++;
        if (this.frameCount >= 15) { // Slower animation than enemies
            this.animationFrame = this.animationFrame === 0 ? 1 : 0;
            this.frameCount = 0;
        }
    }

    /**
     * Renders the princess on the canvas
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    render(ctx) {
        // Render castle first
        this.castle.render(ctx);
        const princessSprite = assets.images['princess_sprite'];
        if (princessSprite) {
            const sourceX = this.animationFrame * 32;
            const sourceY = 0;

            ctx.drawImage(
                princessSprite,
                sourceX, sourceY, 32, 32,
                this.x, this.y, this.width, this.height
            );
        } else {
            // Fallback rendering
            ctx.fillStyle = '#ff69b4';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    /**
     * Marks the princess as reached and triggers victory effects
     * @param {ParticleSystem} particleSystem - The game's particle system
     */
    reach(particleSystem, gameState) {
        if (this.isReached || !this.canBeReached) return;

        // Check if all enemies are defeated
        if (gameState.enemies.length > 0) {
            particleSystem.createScorePopup(
                this.x + this.width / 2,
                this.y - 20,
                "Defeat all enemies first!",
                '#ff0000'
            );
            return;
        }

        this.isReached = true;

        // Create love explosion effect
        particleSystem.createExplosion(
            this.x + this.width / 2,
            this.y + this.height / 2,
            30,
            ['#ff69b4', '#ff1493', '#ffb6c1', '#ffc0cb']
        );

        // Create score popup
        particleSystem.createScorePopup(
            this.x + this.width / 2,
            this.y,
            100
        );
    }
}