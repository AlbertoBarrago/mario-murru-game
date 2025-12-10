/**
 * Manages particle effects
 */
export default class ParticleSystem {
  /**
     * Represents a single particle in the effect system
     */
  #Particle = class {
    /**
         * Creates a new particle
         * @param {number} x - X position
         * @param {number} y - Y position
         * @param {number} velocityX - Horizontal velocity
         * @param {number} velocityY - Vertical velocity
         * @param {number} size - Particle size
         * @param {string} color - Particle color
         * @param {number} life - Particle lifetime in frames
         */
    constructor(x, y, velocityX, velocityY, size, color, life) {
      this.x = x;
      this.y = y;
      this.velocityX = velocityX;
      this.velocityY = velocityY;
      this.size = size;
      this.color = color;
      this.life = life;
      this.alpha = 1;
      this.gravity = 0.1;
    }

    /**
         * Updates the particle state
         * @returns {boolean} - Whether the particle is still alive
         */
    update() {
      this.x += this.velocityX;
      this.y += this.velocityY;
      this.velocityY += this.gravity;
      this.life--;
      this.alpha = this.life / 30; // Fade out as life decreases
      this.size *= 0.97; // Shrink particle over time
      return this.life > 0;
    }

    /**
         * Renders the particle
         * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
         */
    render(ctx) {
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  };
  /**
     * Creates a new particle system
     */
  constructor() {
    this.particles = [];
    this.isPaused = false;
    this.savedParticles = null;
  }

  /**
   * Pauses the particle system
   */
  pause() {
    this.isPaused = true;
    this.savedParticles = this.particles.map(particle => ({
      velocityX: particle.velocityX,
      velocityY: particle.velocityY
    }));
    this.particles.forEach(particle => {
      particle.velocityX = 0;
      particle.velocityY = 0;
    });
  }

  /**
   * Resumes the particle system
   */
  resume() {
    this.isPaused = false;
    if (this.savedParticles) {
      this.particles.forEach((particle, index) => {
        if (this.savedParticles[index]) {
          particle.velocityX = this.savedParticles[index].velocityX;
          particle.velocityY = this.savedParticles[index].velocityY;
        }
      });
      this.savedParticles = null;
    }
  }

  /**
     * Creates an explosion effect at the specified position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} count - Number of particles to create
     * @param {string[]} colors - Array of colors to use for particles
     */
  createExplosion(x, y, count = 20, colors = ["#ff0000", "#ff7700", "#ffff00"]) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      const size = 3 + Math.random() * 3;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const life = 20 + Math.random() * 20;

      this.particles.push(new this.#Particle(x, y, velocityX, velocityY, size, color, life));
    }
  }

  /**
     * Creates a score popup effect at the specified position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} score - Score to display
     */
  createScorePopup(x, y, score) {
    this.scorePopups = this.scorePopups || [];
    this.scorePopups.push({
      x,
      y,
      score,
      life: 40,
      velocityY: -1
    });
  }

  /**
     * Updates all particles
     */
  update() {
    if (!this.isPaused) {
      // Update explosion particles
      this.particles = this.particles.filter(particle => particle.update());

      // Update score popups
      if (this.scorePopups) {
        this.scorePopups = this.scorePopups.filter(popup => {
          popup.y += popup.velocityY;
          popup.life--;
          return popup.life > 0;
        });
      }
    }
  }

  /**
     * Renders all particles
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
  render(ctx) {
    // Render explosion particles
    this.particles.forEach(particle => particle.render(ctx));

    // Render score popups
    if (this.scorePopups) {
      ctx.font = "16px Arial";
      ctx.textAlign = "center";

      this.scorePopups.forEach(popup => {
        const alpha = popup.life / 40;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.fillText(`+${popup.score}`, popup.x, popup.y);
        ctx.strokeText(`+${popup.score}`, popup.x, popup.y);
      });

      ctx.textAlign = "left";
    }
  }
}