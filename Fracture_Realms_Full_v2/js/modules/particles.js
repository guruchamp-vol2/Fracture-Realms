// Advanced Particle System for Fracture Realms
// Enhanced visual effects and feedback

export class ParticleSystem {
  constructor(game) {
    this.game = game;
    this.particles = [];
    this.emitters = [];
    this.maxParticles = 1000;
    
    // Particle pools for performance
    this.particlePool = [];
    this.initializePool();
  }

  initializePool() {
    for (let i = 0; i < this.maxParticles; i++) {
      this.particlePool.push(new Particle());
    }
  }

  getParticle() {
    return this.particlePool.pop() || new Particle();
  }

  returnParticle(particle) {
    particle.reset();
    this.particlePool.push(particle);
  }

  // Enhanced effect methods
  createExplosion(x, y, options = {}) {
    const {
      count = 20,
      speed = 200,
      color = '#ff6b35',
      size = 4,
      life = 1.0,
      gravity = 500
    } = options;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const velocity = speed * (0.5 + Math.random() * 0.5);
      
      this.createParticle({
        x, y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color,
        size: size * (0.5 + Math.random() * 0.5),
        life,
        gravity,
        type: 'explosion'
      });
    }
  }

  createTrail(x, y, direction, options = {}) {
    const {
      count = 8,
      color = '#64b5f6',
      size = 3,
      life = 0.5
    } = options;

    for (let i = 0; i < count; i++) {
      this.createParticle({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: -direction * 100 + (Math.random() - 0.5) * 50,
        vy: (Math.random() - 0.5) * 50,
        color,
        size: size * (0.7 + Math.random() * 0.6),
        life: life * (0.8 + Math.random() * 0.4),
        fade: true,
        type: 'trail'
      });
    }
  }

  createShardGlitter(x, y, options = {}) {
    const {
      count = 12,
      color = '#ffd700',
      size = 2,
      life = 2.0
    } = options;

    for (let i = 0; i < count; i++) {
      this.createParticle({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 100,
        vy: -Math.random() * 150 - 50,
        color,
        size: size * (0.5 + Math.random() * 1.0),
        life: life * (0.8 + Math.random() * 0.4),
        gravity: 300,
        sparkle: true,
        type: 'shard'
      });
    }
  }

  createMagicSparkles(x, y, options = {}) {
    const {
      count = 15,
      colors = ['#e1bee7', '#ce93d8', '#ba68c8'],
      size = 3,
      life = 1.5
    } = options;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      
      this.createParticle({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: size * (0.3 + Math.random() * 0.7),
        life: life * (0.7 + Math.random() * 0.6),
        twinkle: true,
        type: 'magic'
      });
    }
  }

  createBloodSplatter(x, y, direction, options = {}) {
    const {
      count = 10,
      color = '#c62828',
      size = 3,
      life = 2.0
    } = options;

    for (let i = 0; i < count; i++) {
      const spread = Math.PI * 0.6;
      const baseAngle = direction > 0 ? Math.PI : 0;
      const angle = baseAngle + (Math.random() - 0.5) * spread;
      const speed = 80 + Math.random() * 120;
      
      this.createParticle({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        color,
        size: size * (0.5 + Math.random() * 1.0),
        life: life * (0.8 + Math.random() * 0.4),
        gravity: 400,
        sticky: true,
        type: 'blood'
      });
    }
  }

  createSmoke(x, y, options = {}) {
    const {
      count = 8,
      color = 'rgba(100, 100, 100, 0.6)',
      size = 8,
      life = 3.0
    } = options;

    for (let i = 0; i < count; i++) {
      this.createParticle({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 40,
        vy: -Math.random() * 60 - 30,
        color,
        size: size * (0.8 + Math.random() * 0.4),
        life: life * (0.8 + Math.random() * 0.4),
        grow: true,
        fade: true,
        type: 'smoke'
      });
    }
  }

  createLightning(startX, startY, endX, endY, options = {}) {
    const {
      segments = 8,
      color = '#81d4fa',
      width = 3,
      life = 0.3
    } = options;

    const dx = endX - startX;
    const dy = endY - startY;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = startX + dx * t + (Math.random() - 0.5) * 20;
      const y = startY + dy * t + (Math.random() - 0.5) * 20;
      
      this.createParticle({
        x, y,
        vx: 0, vy: 0,
        color,
        size: width * (1 - t * 0.5),
        life,
        glow: true,
        type: 'lightning'
      });
    }
  }

  createEnergyField(centerX, centerY, radius, options = {}) {
    const emitter = new ParticleEmitter({
      x: centerX,
      y: centerY,
      rate: 5,
      life: 10.0,
      ...options,
      particleOptions: {
        spawnRadius: radius,
        color: '#4fc3f7',
        size: 2,
        life: 2.0,
        orbital: true,
        orbitRadius: radius,
        type: 'energy',
        ...options.particleOptions
      }
    });
    
    this.emitters.push(emitter);
    return emitter;
  }

  createParticle(options) {
    if (this.particles.length >= this.maxParticles) {
      return null;
    }

    const particle = this.getParticle();
    particle.initialize(options);
    this.particles.push(particle);
    return particle;
  }

  update(deltaTime) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.update(deltaTime, this.game);
      
      if (particle.isDead()) {
        this.particles.splice(i, 1);
        this.returnParticle(particle);
      }
    }

    // Update emitters
    for (let i = this.emitters.length - 1; i >= 0; i--) {
      const emitter = this.emitters[i];
      emitter.update(deltaTime, this);
      
      if (emitter.isDead()) {
        this.emitters.splice(i, 1);
      }
    }
  }

  render(ctx) {
    if (!this.game.particlesOn) return;

    // Sort particles by type for better rendering
    this.particles.sort((a, b) => {
      const order = { smoke: 0, blood: 1, explosion: 2, trail: 3, magic: 4, lightning: 5, energy: 6, shard: 7 };
      return (order[a.type] || 0) - (order[b.type] || 0);
    });

    for (const particle of this.particles) {
      particle.render(ctx);
    }
  }

  clear() {
    this.particles.forEach(p => this.returnParticle(p));
    this.particles.length = 0;
    this.emitters.length = 0;
  }
}

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.color = '#ffffff';
    this.size = 1;
    this.life = 1;
    this.maxLife = 1;
    this.gravity = 0;
    this.fade = false;
    this.grow = false;
    this.shrink = false;
    this.sparkle = false;
    this.twinkle = false;
    this.glow = false;
    this.sticky = false;
    this.orbital = false;
    this.orbitRadius = 0;
    this.orbitAngle = 0;
    this.orbitSpeed = 1;
    this.type = 'default';
    this.stuck = false;
  }

  initialize(options) {
    Object.assign(this, options);
    this.maxLife = this.life;
    this.initialSize = this.size;
    
    if (this.orbital) {
      this.orbitAngle = Math.random() * Math.PI * 2;
      this.orbitSpeed = 0.5 + Math.random() * 1.5;
    }
  }

  update(deltaTime, game) {
    if (this.orbital) {
      this.orbitAngle += this.orbitSpeed * deltaTime;
      this.x += Math.cos(this.orbitAngle) * this.orbitRadius * deltaTime;
      this.y += Math.sin(this.orbitAngle) * this.orbitRadius * deltaTime;
    } else {
      if (!this.stuck) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        if (this.gravity > 0) {
          this.vy += this.gravity * game.gravDir * deltaTime;
        }
        
        // Check for ground collision if sticky
        if (this.sticky && this.y > game.H - 50) {
          this.stuck = true;
          this.vy = 0;
          this.vx *= 0.7;
        }
      }
    }

    this.life -= deltaTime;
    
    const lifeRatio = this.life / this.maxLife;
    
    if (this.fade) {
      this.alpha = lifeRatio;
    }
    
    if (this.grow) {
      this.size = this.initialSize * (2 - lifeRatio);
    } else if (this.shrink) {
      this.size = this.initialSize * lifeRatio;
    }
    
    if (this.sparkle) {
      this.sparklePhase = (this.sparklePhase || 0) + deltaTime * 10;
    }
    
    if (this.twinkle) {
      this.twinklePhase = (this.twinklePhase || 0) + deltaTime * 8;
    }
  }

  render(ctx) {
    ctx.save();
    
    const alpha = this.alpha !== undefined ? this.alpha : 1;
    
    if (this.glow) {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = this.size * 2;
    }
    
    if (this.sparkle) {
      const sparkleIntensity = (Math.sin(this.sparklePhase) + 1) * 0.5;
      ctx.globalAlpha = alpha * sparkleIntensity;
    } else if (this.twinkle) {
      const twinkleIntensity = (Math.sin(this.twinklePhase) + 1) * 0.5;
      ctx.globalAlpha = alpha * (0.3 + 0.7 * twinkleIntensity);
    } else {
      ctx.globalAlpha = alpha;
    }
    
    if (this.type === 'lightning') {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

class ParticleEmitter {
  constructor(options) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.rate = options.rate || 10; // particles per second
    this.life = options.life || 5;
    this.particleOptions = options.particleOptions || {};
    
    this.timer = 0;
    this.nextEmission = 0;
    this.active = true;
  }

  update(deltaTime, particleSystem) {
    if (!this.active) return;
    
    this.timer += deltaTime;
    this.life -= deltaTime;
    
    if (this.timer >= this.nextEmission) {
      this.emit(particleSystem);
      this.nextEmission = this.timer + (1 / this.rate);
    }
  }

  emit(particleSystem) {
    const options = { ...this.particleOptions };
    
    if (options.spawnRadius) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * options.spawnRadius;
      options.x = this.x + Math.cos(angle) * radius;
      options.y = this.y + Math.sin(angle) * radius;
    } else {
      options.x = this.x;
      options.y = this.y;
    }
    
    particleSystem.createParticle(options);
  }

  isDead() {
    return this.life <= 0;
  }

  stop() {
    this.active = false;
  }
}

export { Particle, ParticleEmitter };
