// Advanced Weapon System for Fracture Realms
// Multiple weapon types and combat styles

export class WeaponSystem {
  constructor(game) {
    this.game = game;
    this.weapons = new Map();
    this.projectiles = [];
    
    this.initializeWeapons();
  }

  initializeWeapons() {
    // Melee Weapons
    this.registerWeapon(new Sword());
    this.registerWeapon(new Hammer());
    this.registerWeapon(new Scythe());
    this.registerWeapon(new Claws());
    
    // Ranged Weapons
    this.registerWeapon(new MagicOrb());
    this.registerWeapon(new Crossbow());
    this.registerWeapon(new FireStaff());
    this.registerWeapon(new LightningRod());
    
    // Special Weapons
    this.registerWeapon(new ChainBlade());
    this.registerWeapon(new ShadowDagger());
    this.registerWeapon(new CrystalCannon());
    this.registerWeapon(new VoidRipper());
  }

  registerWeapon(weapon) {
    this.weapons.set(weapon.id, weapon);
  }

  getWeapon(weaponId) {
    return this.weapons.get(weaponId);
  }

  equipWeapon(player, weaponId) {
    const weapon = this.getWeapon(weaponId);
    if (!weapon) return false;

    player.weapon = weapon;
    player.weaponCooldown = 0;
    player.weaponCombo = 0;
    
    this.game.log(`Equipped: ${weapon.name}`, 'ok');
    return true;
  }

  useWeapon(player, attackType = 'primary') {
    if (!player.weapon || player.weaponCooldown > 0) return false;

    const weapon = player.weapon;
    let attack = null;

    if (attackType === 'primary') {
      attack = weapon.primaryAttack;
    } else if (attackType === 'secondary') {
      attack = weapon.secondaryAttack;
    } else if (attackType === 'special' && weapon.specialAttack) {
      attack = weapon.specialAttack;
    }

    if (!attack) return false;

    // Execute attack
    const result = attack.execute(player, this.game, this);
    
    if (result.success) {
      player.weaponCooldown = attack.cooldown * (player.attackSpeedMult ? 1 / player.attackSpeedMult : 1);
      player.weaponCombo = Math.min(weapon.maxCombo || 10, player.weaponCombo + 1);
      
      // Sound effects
      if (attack.sound) {
        this.game.audio[attack.sound]?.();
      }
      
      // Visual effects
      if (attack.effect) {
        attack.effect(player, this.game);
      }
    }

    return result.success;
  }

  update(deltaTime) {
    // Update weapon cooldowns
    for (const player of this.game.players) {
      if (player.weaponCooldown > 0) {
        player.weaponCooldown -= deltaTime;
      }
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(deltaTime, this.game);
      
      if (projectile.isDead()) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  render(ctx) {
    // Render projectiles
    for (const projectile of this.projectiles) {
      projectile.render(ctx);
    }
    
    // Render weapon UI
    this.renderWeaponUI(ctx);
  }

  renderWeaponUI(ctx) {
    const player = this.game.players[0];
    if (!player.weapon) return;

    ctx.save();
    
    const weapon = player.weapon;
    const x = 16;
    const y = this.game.H - 100;
    
    // Weapon background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, 200, 60);
    
    ctx.strokeStyle = weapon.rarity.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 200, 60);
    
    // Weapon icon
    ctx.fillStyle = weapon.rarity.color;
    ctx.font = '24px sans-serif';
    ctx.fillText(weapon.icon, x + 8, y + 32);
    
    // Weapon name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(weapon.name, x + 40, y + 20);
    
    // Combo counter
    if (player.weaponCombo > 0) {
      ctx.fillStyle = '#ffeb3b';
      ctx.font = '10px sans-serif';
      ctx.fillText(`Combo: ${player.weaponCombo}`, x + 40, y + 35);
    }
    
    // Cooldown indicator
    if (player.weaponCooldown > 0) {
      const maxCooldown = weapon.primaryAttack.cooldown;
      const progress = 1 - (player.weaponCooldown / maxCooldown);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(x + 40, y + 40, 150, 6);
      
      ctx.fillStyle = weapon.rarity.color;
      ctx.fillRect(x + 40, y + 40, 150 * progress, 6);
    }
    
    ctx.restore();
  }

  createProjectile(options) {
    const projectile = new Projectile(options);
    this.projectiles.push(projectile);
    return projectile;
  }
}

// Base Weapon Class
class BaseWeapon {
  constructor(options) {
    this.id = options.id;
    this.name = options.name;
    this.icon = options.icon || '⚔️';
    this.type = options.type; // 'melee', 'ranged', 'special'
    this.rarity = options.rarity || Rarity.COMMON;
    this.damage = options.damage || 10;
    this.range = options.range || 50;
    this.maxCombo = options.maxCombo || 5;
    
    this.primaryAttack = options.primaryAttack;
    this.secondaryAttack = options.secondaryAttack;
    this.specialAttack = options.specialAttack;
  }
}

// Weapon Rarity System
const Rarity = {
  COMMON: { name: 'Common', color: '#9e9e9e', multiplier: 1.0 },
  UNCOMMON: { name: 'Uncommon', color: '#4caf50', multiplier: 1.2 },
  RARE: { name: 'Rare', color: '#2196f3', multiplier: 1.5 },
  EPIC: { name: 'Epic', color: '#9c27b0', multiplier: 2.0 },
  LEGENDARY: { name: 'Legendary', color: '#ff9800', multiplier: 3.0 }
};

// Attack Class
class Attack {
  constructor(options) {
    this.name = options.name;
    this.damage = options.damage;
    this.cooldown = options.cooldown || 1.0;
    this.range = options.range || 50;
    this.sound = options.sound;
    this.effect = options.effect;
    this.execute = options.execute;
  }
}

// Projectile Class
class Projectile {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.vx = options.vx || 0;
    this.vy = options.vy || 0;
    this.damage = options.damage || 10;
    this.size = options.size || 4;
    this.color = options.color || '#ffffff';
    this.life = options.life || 3.0;
    this.maxLife = this.life;
    this.piercing = options.piercing || false;
    this.homing = options.homing || false;
    this.explosive = options.explosive || false;
    this.fromPlayer = options.fromPlayer || true;
    this.hitTargets = new Set();
    this.type = options.type || 'projectile';
    this.trail = options.trail || false;
    this.gravity = options.gravity || 0;
  }

  update(deltaTime, game) {
    // Movement
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    
    if (this.gravity > 0) {
      this.vy += this.gravity * game.gravDir * deltaTime;
    }
    
    // Homing behavior
    if (this.homing && this.fromPlayer) {
      const nearestEnemy = this.findNearestEnemy(game);
      if (nearestEnemy) {
        const dx = nearestEnemy.pos.x - this.x;
        const dy = nearestEnemy.pos.y - this.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 0) {
          const homingForce = 200;
          this.vx += (dx / dist) * homingForce * deltaTime;
          this.vy += (dy / dist) * homingForce * deltaTime;
        }
      }
    }
    
    // Trail effect
    if (this.trail) {
      game.particleSystem?.createTrail(this.x, this.y, Math.sign(this.vx), {
        color: this.color,
        size: this.size * 0.5
      });
    }
    
    // Collision detection
    this.checkCollisions(game);
    
    // Life countdown
    this.life -= deltaTime;
    
    // Bounds checking
    if (this.x < -50 || this.x > game.W + 50 || this.y < -50 || this.y > game.H + 50) {
      this.life = 0;
    }
  }

  checkCollisions(game) {
    const projectileRect = {
      x: this.x - this.size,
      y: this.y - this.size,
      w: this.size * 2,
      h: this.size * 2
    };

    if (this.fromPlayer) {
      // Hit enemies
      for (const enemy of game.enemies) {
        if (enemy.hp <= 0 || this.hitTargets.has(enemy)) continue;
        
        if (game.rectsOverlap(projectileRect, enemy.rect())) {
          this.hitEnemy(enemy, game);
          
          if (!this.piercing) {
            this.life = 0;
            return;
          }
        }
      }
      
      // Hit boss
      if (game.boss && !this.hitTargets.has(game.boss)) {
        if (game.rectsOverlap(projectileRect, game.boss.rect())) {
          this.hitBoss(game.boss, game);
          
          if (!this.piercing) {
            this.life = 0;
            return;
          }
        }
      }
    } else {
      // Hit players
      for (const player of game.players) {
        if (!player.alive || player.invincible || this.hitTargets.has(player)) continue;
        
        if (game.rectsOverlap(projectileRect, player.rect())) {
          this.hitPlayer(player, game);
          
          if (!this.piercing) {
            this.life = 0;
            return;
          }
        }
      }
    }
  }

  hitEnemy(enemy, game) {
    enemy.hp -= this.damage;
    this.hitTargets.add(enemy);
    
    game.particleSystem?.createBloodSplatter(enemy.pos.x, enemy.pos.y, Math.sign(this.vx));
    game.audio.hit();
    
    if (this.explosive) {
      this.explode(game);
    }
  }

  hitBoss(boss, game) {
    boss.hp -= this.damage;
    this.hitTargets.add(boss);
    
    game.particleSystem?.createExplosion(boss.pos.x, boss.pos.y, {
      color: this.color,
      count: 15
    });
    game.audio.hit();
    
    if (this.explosive) {
      this.explode(game);
    }
  }

  hitPlayer(player, game) {
    const damage = this.damage * (player.damageTakenMult || 1);
    player.hp -= damage;
    player.iframes = 0.6;
    this.hitTargets.add(player);
    
    game.shake(8, 200);
    
    if (this.explosive) {
      this.explode(game);
    }
  }

  explode(game) {
    game.particleSystem?.createExplosion(this.x, this.y, {
      color: this.color,
      count: 25,
      speed: 300
    });
    
    // Damage nearby entities
    const explosionRadius = 80;
    const explosionDamage = this.damage * 0.8;
    
    for (const enemy of game.enemies) {
      const dist = Math.hypot(enemy.pos.x - this.x, enemy.pos.y - this.y);
      if (dist <= explosionRadius) {
        enemy.hp -= explosionDamage;
      }
    }
    
    if (game.boss) {
      const dist = Math.hypot(game.boss.pos.x - this.x, game.boss.pos.y - this.y);
      if (dist <= explosionRadius) {
        game.boss.hp -= explosionDamage;
      }
    }
  }

  findNearestEnemy(game) {
    let nearest = null;
    let nearestDist = Infinity;
    
    for (const enemy of game.enemies) {
      if (enemy.hp <= 0) continue;
      
      const dist = Math.hypot(enemy.pos.x - this.x, enemy.pos.y - this.y);
      if (dist < nearestDist) {
        nearest = enemy;
        nearestDist = dist;
      }
    }
    
    if (game.boss && game.boss.hp > 0) {
      const dist = Math.hypot(game.boss.pos.x - this.x, game.boss.pos.y - this.y);
      if (dist < nearestDist) {
        nearest = game.boss;
      }
    }
    
    return nearest;
  }

  render(ctx) {
    ctx.save();
    
    // Glow effect for special projectiles
    if (this.type === 'magic' || this.type === 'energy') {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = this.size * 2;
    }
    
    ctx.fillStyle = this.color;
    ctx.beginPath();
    
    if (this.type === 'arrow') {
      // Draw arrow shape
      const angle = Math.atan2(this.vy, this.vx);
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);
      ctx.fillRect(-this.size * 2, -this.size / 2, this.size * 4, this.size);
      ctx.fillRect(this.size, -this.size, this.size * 2, this.size * 2);
    } else {
      // Draw circle
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

// Weapon Implementations

class Sword extends BaseWeapon {
  constructor() {
    super({
      id: 'sword',
      name: 'Iron Sword',
      icon: '⚔️',
      type: 'melee',
      rarity: Rarity.COMMON,
      damage: 15,
      range: 60,
      primaryAttack: new Attack({
        name: 'Slash',
        damage: 15,
        cooldown: 0.8,
        range: 60,
        sound: 'hit',
        execute: (player, game, weaponSystem) => {
          const hb = game.meleeHitbox(player);
          let hitSomething = false;
          
          for (const enemy of game.enemies) {
            if (enemy.hp <= 0) continue;
            if (game.rectsOverlap(hb, enemy.rect())) {
              enemy.hp -= 15 * (player.damageMult || 1);
              game.fxSlash(enemy.pos.x, enemy.pos.y);
              hitSomething = true;
            }
          }
          
          if (game.boss && game.rectsOverlap(hb, game.boss.rect())) {
            game.boss.hp -= 15 * (player.damageMult || 1);
            game.fxSlash(game.boss.pos.x, game.boss.pos.y, true);
            hitSomething = true;
          }
          
          return { success: true, hitSomething };
        }
      }),
      secondaryAttack: new Attack({
        name: 'Thrust',
        damage: 25,
        cooldown: 1.5,
        range: 80,
        sound: 'hit',
        execute: (player, game, weaponSystem) => {
          const reach = 80;
          const hb = {
            x: player.facing > 0 ? player.pos.x : player.pos.x - reach,
            y: player.pos.y - 20,
            w: reach,
            h: 40
          };
          
          let hitSomething = false;
          
          for (const enemy of game.enemies) {
            if (enemy.hp <= 0) continue;
            if (game.rectsOverlap(hb, enemy.rect())) {
              enemy.hp -= 25 * (player.damageMult || 1);
              enemy.vel.x += player.facing * 200;
              game.fxSlash(enemy.pos.x, enemy.pos.y);
              hitSomething = true;
            }
          }
          
          return { success: true, hitSomething };
        }
      })
    });
  }
}

class MagicOrb extends BaseWeapon {
  constructor() {
    super({
      id: 'magic_orb',
      name: 'Mystic Orb',
      icon: '🔮',
      type: 'ranged',
      rarity: Rarity.UNCOMMON,
      damage: 12,
      range: 400,
      primaryAttack: new Attack({
        name: 'Magic Missile',
        damage: 12,
        cooldown: 0.6,
        range: 400,
        sound: 'pew',
        execute: (player, game, weaponSystem) => {
          const speed = 500;
          const angle = player.facing > 0 ? 0 : Math.PI;
          
          weaponSystem.createProjectile({
            x: player.pos.x,
            y: player.pos.y - 10,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            damage: 12 * (player.damageMult || 1),
            color: '#e1bee7',
            size: 6,
            life: 2.0,
            type: 'magic',
            trail: true
          });
          
          return { success: true };
        }
      }),
      secondaryAttack: new Attack({
        name: 'Homing Orb',
        damage: 20,
        cooldown: 2.0,
        range: 600,
        sound: 'pew',
        execute: (player, game, weaponSystem) => {
          weaponSystem.createProjectile({
            x: player.pos.x,
            y: player.pos.y - 10,
            vx: player.facing * 200,
            vy: 0,
            damage: 20 * (player.damageMult || 1),
            color: '#9c27b0',
            size: 8,
            life: 5.0,
            type: 'magic',
            homing: true,
            trail: true
          });
          
          return { success: true };
        }
      })
    });
  }
}

class Hammer extends BaseWeapon {
  constructor() {
    super({
      id: 'hammer',
      name: 'War Hammer',
      icon: '🔨',
      type: 'melee',
      rarity: Rarity.RARE,
      damage: 30,
      range: 70,
      primaryAttack: new Attack({
        name: 'Smash',
        damage: 30,
        cooldown: 1.5,
        range: 70,
        sound: 'hit',
        execute: (player, game, weaponSystem) => {
          const hb = game.meleeHitbox(player);
          let hitSomething = false;
          
          for (const enemy of game.enemies) {
            if (enemy.hp <= 0) continue;
            if (game.rectsOverlap(hb, enemy.rect())) {
              enemy.hp -= 30 * (player.damageMult || 1);
              enemy.vel.y -= 300 * game.gravDir; // Knockup
              game.fxSlash(enemy.pos.x, enemy.pos.y);
              hitSomething = true;
            }
          }
          
          if (hitSomething) {
            game.shake(12, 300);
            game.particleSystem?.createExplosion(player.pos.x + player.facing * 40, player.pos.y, {
              color: '#795548',
              count: 20
            });
          }
          
          return { success: true, hitSomething };
        }
      })
    });
  }
}

class FireStaff extends BaseWeapon {
  constructor() {
    super({
      id: 'fire_staff',
      name: 'Inferno Staff',
      icon: '🔥',
      type: 'ranged',
      rarity: Rarity.EPIC,
      damage: 18,
      range: 500,
      primaryAttack: new Attack({
        name: 'Fireball',
        damage: 18,
        cooldown: 1.0,
        range: 500,
        sound: 'pew',
        execute: (player, game, weaponSystem) => {
          weaponSystem.createProjectile({
            x: player.pos.x,
            y: player.pos.y - 10,
            vx: player.facing * 400,
            vy: -50,
            damage: 18 * (player.damageMult || 1),
            color: '#ff5722',
            size: 10,
            life: 3.0,
            type: 'magic',
            explosive: true,
            trail: true,
            gravity: 200
          });
          
          return { success: true };
        }
      })
    });
  }
}

// Export all classes
export { BaseWeapon, Attack, Projectile, Rarity, Sword, MagicOrb, Hammer, FireStaff };
