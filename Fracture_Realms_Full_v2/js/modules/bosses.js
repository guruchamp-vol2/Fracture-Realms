// js/modules/bosses.js — FULL FILE REPLACE (word for word)

// Removed the import from ../game.js to avoid a circular dependency.
// Define the tiny utilities we need locally.
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a = 1, b = 0) => Math.random() * (b - a) + a;

class Rect {
  constructor(x, y, w, h) { this.x = x; this.y = y; this.w = w; this.h = h; }
}

export function makeBosses(game) {
  const W = () => game.W, H = () => game.H;

  class BaseBoss {
    constructor(name, x, y, w, h, hp) {
      this.name = name;
      this.pos = { x, y };
      this.vel = { x: 0, y: 0 };
      this.w = w; this.h = h;
      this.onGround = false;
      this.hp = hp; this.maxHP = hp;
      this.enraged = false;
      this.cool = 0;
    }
    rect() { return new Rect(this.pos.x - this.w / 2, this.pos.y - this.h / 2, this.w, this.h); }
    update(_dt) { /* abstract */ }
  }

  // --- Airborne Titan: only takes good damage from airborne attacks in game.js ---
  class AirborneTitan extends BaseBoss {
    constructor() { super('Airborne Titan', W() * 0.5, H() * 0.25, 110, 140, 800); }
    update(dt) {
      this.cool = Math.max(0, this.cool - dt);
      this.vel.y += game.MOD.gravity * 0.8 * game.gravDir * dt;

      if (this.onGround && this.cool <= 0) {
        // big hop + shock ring + downward junk
        this.vel.y -= (this.enraged ? 740 : 600) * game.gravDir;
        this.cool = this.enraged ? 1.4 : 2.2;
        for (let i = -2; i <= 2; i++) {
          game.bullets.push({
            x: this.pos.x,
            y: this.pos.y + (this.h / 2) * game.gravDir,
            vx: i * 160,
            vy: 160 * game.gravDir,
            life: 1.6,
            dmg: 0
          });
        }
        game.fxBossLand(this.pos.x, this.pos.y);
      }

      const target = game.players[0];
      this.vel.x = lerp(this.vel.x, Math.sign(target.pos.x - this.pos.x) * (this.enraged ? 160 : 110), 0.05);
      game.collideWithPlatforms(this, dt);
    }
  }

  // --- Mirror Swarm: spawns clones that mirror motion and body-check the player ---
  class MirrorSwarm extends BaseBoss {
    constructor() {
      super('Mirror Swarm', W() * 0.5, H() * 0.25, 90, 110, 700);
      this.clones = [];
      this.timer = 0;
    }
    update(dt) {
      this.timer += dt;
      this.cool = Math.max(0, this.cool - dt);
      const p = game.players[0];

      // spawn clone that mirrors the player
      if (this.timer > (this.enraged ? 2.2 : 3.2)) {
        this.timer = 0;
        const c = { x: this.pos.x + (Math.random() * 2 - 1) * 60, y: this.pos.y, vx: 0, vy: 0, life: 3 };
        this.clones.push(c);
        game.log('The swarm mirrors your move...');
      }

      // update clones
      for (const c of this.clones) {
        c.vx = lerp(c.vx, Math.sign(p.pos.x - c.x) * (this.enraged ? 300 : 220), 0.1);
        c.vy += game.MOD.gravity * 0.6 * game.gravDir * dt;
        c.x += c.vx * dt; c.y += c.vy * dt; c.life -= dt;
        if (c.life < 0) c.dead = true;

        if (game.rectsOverlap(new Rect(c.x - 20, c.y - 20, 40, 40), p.rect()) && p.iframes <= 0) {
          p.hp -= 10; p.iframes = 0.6; game.shake();
        }
      }
      this.clones = this.clones.filter(c => !c.dead && c.life > 0);

      // slow drift + radial no-damage bullets (hazard)
      this.vel.y += game.MOD.gravity * 0.3 * game.gravDir * dt;
      if (this.cool <= 0) {
        this.cool = (this.enraged ? 1.8 : 2.6);
        const N = 6;
        for (let i = 0; i < N; i++) {
          const a = (i / N) * Math.PI * 2;
          game.bullets.push({
            x: this.pos.x,
            y: this.pos.y,
            vx: Math.cos(a) * 140,
            vy: Math.sin(a) * 140,
            life: 1.6,
            dmg: 0
          });
        }
      }
      game.collideWithPlatforms(this, dt);
    }
  }

  // --- Gravity Serpent: flips gravity and dashes ---
  class GravitySerpent extends BaseBoss {
    constructor() { super('Gravity Serpent', W() * 0.5, H() * 0.25, 100, 120, 760); this.dashTimer = 0; }
    update(dt) {
      this.cool = Math.max(0, this.cool - dt);
      this.dashTimer += dt;

      if (this.dashTimer > (this.enraged ? 1.4 : 2.2)) {
        this.dashTimer = 0;
        game.gravDir *= -1;
        game.log('The serpent twists gravity!', 'warn');
        const dir = Math.random() < 0.5 ? -1 : 1;
        this.vel.x = dir * (this.enraged ? 520 : 420);
        this.vel.y += (this.enraged ? -200 : -140) * game.gravDir;
      }

      this.vel.y += game.MOD.gravity * 0.8 * game.gravDir * dt;
      const t = game.players[0];
      this.vel.x = lerp(this.vel.x, Math.sign(t.pos.x - this.pos.x) * (this.enraged ? 170 : 120), 0.05);
      game.collideWithPlatforms(this, dt);
    }
  }

  // --- Chrono Warden: causes time pulses + radial hazards ---
  class ChronoWarden extends BaseBoss {
    constructor() { super('Chrono Warden', W() * 0.5, H() * 0.25, 100, 120, 780); this.timer = 0; }
    update(dt) {
      this.timer += dt;
      this.cool = Math.max(0, this.cool - dt);

      if (this.timer > (this.enraged ? 2.2 : 3.2)) {
        this.timer = 0;
        const target = rand(0.5, 1.8);
        game.pulseTo(target);
        game.log('Time heaves and lurches...', 'warn');
        const N = 12;
        for (let i = 0; i < N; i++) {
          const a = (i / N) * Math.PI * 2;
          game.bullets.push({ x: this.pos.x, y: this.pos.y, vx: Math.cos(a) * 180, vy: Math.sin(a) * 180, life: 1.4, dmg: 0 });
        }
      }

      this.vel.y += game.MOD.gravity * 0.8 * game.gravDir * dt;
      const t = game.players[0];
      this.vel.x = lerp(this.vel.x, Math.sign(t.pos.x - this.pos.x) * (this.enraged ? 150 : 110), 0.05);
      game.collideWithPlatforms(this, dt);
    }
  }

  const types = {
    'Airborne Titan': AirborneTitan,
    'Mirror Swarm': MirrorSwarm,
    'Gravity Serpent': GravitySerpent,
    'Chrono Warden': ChronoWarden
  };
  const pool = [AirborneTitan, MirrorSwarm, GravitySerpent, ChronoWarden];

  return {
    pick(name) {
      const C = name ? (types[name] || pool[0]) : pool[Math.floor(Math.random() * pool.length)];
      return new C();
    }
  };
}
