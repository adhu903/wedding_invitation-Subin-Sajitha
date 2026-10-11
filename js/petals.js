/**
 * Flower Petals & Golden Confetti Canvas Animation
 * High-performance 60fps simulation with 3D rotation, fluttering physics, and custom petal shapes.
 */

class FlowerPetalSystem {
  constructor(canvasId = 'petals-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = canvasId;
      document.body.appendChild(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.isActive = false;
    this.animationFrame = null;
    this.resize();

    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  // Trigger an explosive celebration burst
  popBurst(count = 90) {
    this.isActive = true;
    const centerX = this.width / 2;
    const centerY = this.height * 0.45; // Burst around the scratch card center

    // Curated wedding palette: Rose petals, cream blossoms, champagne gold leaf
    const colors = [
      { fill: '#f78ca0', stroke: '#e8637e', type: 'rose' },       // Soft Pink Rose
      { fill: '#fba1b7', stroke: '#ef7d99', type: 'rose' },       // Blush Rose
      { fill: '#fff2e2', stroke: '#e8d4c1', type: 'cream' },      // Jasmine Cream
      { fill: '#ffd700', stroke: '#daa520', type: 'gold_foil' },  // Shiny Gold Leaf
      { fill: '#fbf5b7', stroke: '#b38728', type: 'gold_foil' },  // Champagne Gold
      { fill: '#e6a15c', stroke: '#b56d2e', type: 'marigold' },   // Kerala Marigold
      { fill: '#ffffff', stroke: '#e0e0e0', type: 'petal' }       // White blossom
    ];

    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 4 + Math.random() * 11;
      const colorScheme = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push({
        x: centerX + (Math.random() - 0.5) * 40,
        y: centerY + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.4),
        vy: (Math.sin(angle) * speed - 5.5) * (0.8 + Math.random() * 0.4), // Upward burst
        radius: 7 + Math.random() * 9,
        color: colorScheme.fill,
        strokeColor: colorScheme.stroke,
        type: colorScheme.type,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 6,
        flipAngle: Math.random() * Math.PI,
        flipSpeed: 0.05 + Math.random() * 0.08,
        flutterSpeed: 0.03 + Math.random() * 0.05,
        wobble: Math.random() * Math.PI * 2,
        gravity: 0.12 + Math.random() * 0.06,
        drag: 0.985,
        opacity: 1,
        fadeSpeed: 0.003 + Math.random() * 0.003
      });
    }

    if (!this.animationFrame) {
      this.loop();
    }
  }

  // Draw an organic curved petal
  drawPetal(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    // 3D tumble along vertical axis
    const scaleX = Math.cos(p.flipAngle);
    ctx.scale(scaleX, 1);

    ctx.globalAlpha = Math.max(0, p.opacity);

    if (p.type === 'gold_foil') {
      // Golden shimmering confetti square / diamond
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.strokeColor;
      ctx.lineWidth = 0.5;
      ctx.fillRect(-p.radius * 0.7, -p.radius * 0.7, p.radius * 1.4, p.radius * 1.4);
      ctx.strokeRect(-p.radius * 0.7, -p.radius * 0.7, p.radius * 1.4, p.radius * 1.4);
    } else {
      // Organic Rose Petal Shape using Bezier Curves
      ctx.beginPath();
      ctx.moveTo(0, -p.radius);
      ctx.bezierCurveTo(p.radius * 0.8, -p.radius * 0.8, p.radius * 1.2, p.radius * 0.4, 0, p.radius);
      ctx.bezierCurveTo(-p.radius * 1.2, p.radius * 0.4, -p.radius * 0.8, -p.radius * 0.8, 0, -p.radius);
      ctx.closePath();

      ctx.fillStyle = p.color;
      ctx.fill();

      // Subtle border line for realism
      ctx.strokeStyle = p.strokeColor;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Center delicate petal vein
      ctx.beginPath();
      ctx.moveTo(0, -p.radius * 0.7);
      ctx.lineTo(0, p.radius * 0.5);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    ctx.restore();
  }

  loop() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Physics update
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity;

      // Gentle horizontal fluttering wave
      p.wobble += p.flutterSpeed;
      p.x += p.vx + Math.sin(p.wobble) * 1.3;
      p.y += p.vy;

      p.rotation += p.rotationSpeed;
      p.flipAngle += p.flipSpeed;
      p.opacity -= p.fadeSpeed;

      // Draw particle
      this.drawPetal(this.ctx, p);

      // Remove off-screen or faded particles
      if (p.opacity <= 0 || p.y > this.height + 40) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > 0) {
      this.animationFrame = requestAnimationFrame(() => this.loop());
    } else {
      this.isActive = false;
      this.animationFrame = null;
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }
}

// Global instance
window.weddingPetals = new FlowerPetalSystem();
