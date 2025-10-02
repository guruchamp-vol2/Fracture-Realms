// Power-up System for Fracture Realms
// Collectible temporary abilities and enhancements

export class PowerUpSystem {
  constructor(game) {
    this.game = game;
    this.activePowerUps = new Map();
    this.availablePowerUps = [];
    this.spawnTimer = 0;
    this.spawnInterval = 15; // seconds between spawns
    
    this.initializePowerUpTypes();
  }

  initializePowerUpTypes() {
    this.powerUpTypes = {
      // Combat Power-ups
      DOUBLE_DAMAGE: {
        id: 'double_damage',
        name: 'Double Damage',
        icon: '⚔️',
        color: '#f44336',
        duration: 15,
        description: 'All attacks deal double damage',
        rarity: 'common',
        effect: (player) => {
          player.damageMult = (player.damageMult || 1) * 2;
        },
        cleanup: (player) => {
          player.damageMult = (player.damageMult || 2) / 2;
        }
      },

      RAPID_FIRE: {
        id: 'rapid_fire',
        name: 'Rapid Fire',
        icon: '💥',
        color: '#ff9800',
        duration: 12,
        description: 'Increased attack speed',
        rarity: 'common',
        effect: (player) => {
          player.attackSpeedMult = (player.attackSpeedMult || 1) * 2;
        },
        cleanup: (player) => {
          player.attackSpeedMult = (player.attackSpeedMult || 2) / 2;
        }
      },

      INVINCIBILITY: {
        id: 'invincibility',
        name: 'Invincibility',
        icon: '🛡️',
        color: '#4caf50',
        duration: 8,
        description: 'Immune to all damage',
        rarity: 'rare',
        effect: (player) => {
          player.invincible = true;
          player.invincibilityVisual = true;
        },
        cleanup: (player) => {
          player.invincible = false;
          player.invincibilityVisual = false;
        }
      },

      // Movement Power-ups
      SUPER_SPEED: {
        id: 'super_speed',
        name: 'Super Speed',
        icon: '💨',
        color: '#2196f3',
        duration: 20,
        description: 'Greatly increased movement speed',
        rarity: 'uncommon',
        effect: (player) => {
          player.speedMult = (player.speedMult || 1) * 2.5;
        },
        cleanup: (player) => {
          player.speedMult = (player.speedMult || 2.5) / 2.5;
        }
      },

      FLIGHT: {
        id: 'flight',
        name: 'Flight',
        icon: '🕊️',
        color: '#e1bee7',
        duration: 15,
        description: 'Temporary flight ability',
        rarity: 'rare',
        effect: (player) => {
          player.canFly = true;
          player.flightEnergy = 100;
        },
        cleanup: (player) => {
          player.canFly = false;
          player.flightEnergy = 0;
        }
      },

      MULTI_JUMP: {
        id: 'multi_jump',
        name: 'Multi Jump',
        icon: '🦘',
        color: '#8bc34a',
        duration: 25,
        description: 'Unlimited jumps',
        rarity: 'uncommon',
        effect: (player) => {
          player.infiniteJumps = true;
        },
        cleanup: (player) => {
          player.infiniteJumps = false;
        }
      },

      // Special Power-ups
      TIME_SLOW: {
        id: 'time_slow',
        name: 'Time Slow',
        icon: '⏰',
        color: '#9c27b0',
        duration: 10,
        description: 'Slows down time around you',
        rarity: 'epic',
        effect: (player) => {
          this.game.timeScale = 0.3;
          this.game.playerTimeScale = 1.0;
        },
        cleanup: (player) => {
          this.game.timeScale = 1.0;
          this.game.playerTimeScale = 1.0;
        }
      },

      SHARD_MAGNET: {
        id: 'shard_magnet',
        name: 'Shard Magnet',
        icon: '🧲',
        color: '#ffc107',
        duration: 30,
        description: 'Automatically collect nearby shards',
        rarity: 'common',
        effect: (player) => {
          player.shardMagnet = true;
          player.magnetRange = 150;
        },
        cleanup: (player) => {
          player.shardMagnet = false;
          player.magnetRange = 0;
        }
      },

      GHOST_MODE: {
        id: 'ghost_mode',
        name: 'Ghost Mode',
        icon: '👻',
        color: '#607d8b',
        duration: 12,
        description: 'Phase through platforms and enemies',
        rarity: 'rare',
        effect: (player) => {
          player.ghostMode = true;
          player.ghostVisual = true;
        },
        cleanup: (player) => {
          player.ghostMode = false;
          player.ghostVisual = false;
        }
      },

      // Legendary Power-ups
      BERSERKER: {
        id: 'berserker',
        name: 'Berserker',
        icon: '😤',
        color: '#d32f2f',
        duration: 20,
        description: 'Damage and speed increase, but take more damage',
        rarity: 'legendary',
        effect: (player) => {
          player.damageMult = (player.damageMult || 1) * 3;
          player.speedMult = (player.speedMult || 1) * 2;
          player.damageTakenMult = (player.damageTakenMult || 1) * 1.5;
        },
        cleanup: (player) => {
          player.damageMult = (player.damageMult || 3) / 3;
          player.speedMult = (player.speedMult || 2) / 2;
          player.damageTakenMult = (player.damageTakenMult || 1.5) / 1.5;
        }
      },

      ELEMENTAL_MASTER: {
        id: 'elemental_master',
        name: 'Elemental Master',
        icon: '🌟',
        color: '#ff5722',
        duration: 25,
        description: 'All attacks have elemental effects',
        rarity: 'legendary',
        effect: (player) => {
          player.elementalAttacks = true;
          player.fireElement = true;
          player.iceElement = true;
          player.lightningElement = true;
        },
        cleanup: (player) => {
          player.elementalAttacks = false;
          player.fireElement = false;
          player.iceElement = false;
          player.lightningElement = false;
        }
      }
    };
  }

  update(deltaTime) {
    // Update active power-ups
    for (const [playerId, powerUps] of this.activePowerUps) {
      for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.timeLeft -= deltaTime;
        
        if (powerUp.timeLeft <= 0) {
          this.removePowerUp(playerId, powerUp);
          powerUps.splice(i, 1);
        }
      }
    }

    // Update available power-ups
    for (let i = this.availablePowerUps.length - 1; i >= 0; i--) {
      const powerUp = this.availablePowerUps[i];
      powerUp.floatOffset += deltaTime * 2;
      powerUp.rotationOffset += deltaTime * 3;
      
      // Check for collection
      const player = this.game.players[0];
      if (this.game.rectsOverlap(powerUp.getRect(), player.rect())) {
        this.collectPowerUp(player, powerUp);
        this.availablePowerUps.splice(i, 1);
      }
      
      // Remove after timeout
      powerUp.lifeTime -= deltaTime;
      if (powerUp.lifeTime <= 0) {
        this.availablePowerUps.splice(i, 1);
      }
    }

    // Spawn new power-ups
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval && this.availablePowerUps.length < 3) {
      this.spawnRandomPowerUp();
      this.spawnTimer = 0;
    }
  }

  spawnRandomPowerUp() {
    const powerUpIds = Object.keys(this.powerUpTypes);
    const weightedIds = [];
    
    // Weight by rarity
    for (const id of powerUpIds) {
      const powerUp = this.powerUpTypes[id];
      let weight = 1;
      
      switch (powerUp.rarity) {
        case 'common': weight = 10; break;
        case 'uncommon': weight = 5; break;
        case 'rare': weight = 2; break;
        case 'epic': weight = 1; break;
        case 'legendary': weight = 0.5; break;
      }
      
      for (let i = 0; i < weight; i++) {
        weightedIds.push(id);
      }
    }
    
    const selectedId = weightedIds[Math.floor(Math.random() * weightedIds.length)];
    this.spawnPowerUp(selectedId);
  }

  spawnPowerUp(powerUpId, x = null, y = null) {
    const powerUpType = this.powerUpTypes[powerUpId];
    if (!powerUpType) return;

    // Random position if not specified
    if (x === null) x = 100 + Math.random() * (this.game.W - 200);
    if (y === null) y = 100 + Math.random() * (this.game.H * 0.6);

    const powerUp = new PowerUpPickup(powerUpType, x, y);
    this.availablePowerUps.push(powerUp);
    
    // Visual effect
    this.game.particleSystem?.createShardGlitter(x, y, {
      color: powerUpType.color,
      count: 20
    });
  }

  collectPowerUp(player, powerUpPickup) {
    const powerUpType = powerUpPickup.type;
    
    this.applyPowerUp(player.id, powerUpType);
    
    // Effects
    this.game.audio.victory();
    this.game.particleSystem?.createExplosion(powerUpPickup.x, powerUpPickup.y, {
      color: powerUpType.color,
      count: 30
    });
    
    // UI notification
    this.showPowerUpNotification(powerUpType);
    
    this.game.log(`Power-up collected: ${powerUpType.name}`, 'ok');
  }

  applyPowerUp(playerId, powerUpType) {
    if (!this.activePowerUps.has(playerId)) {
      this.activePowerUps.set(playerId, []);
    }
    
    const playerPowerUps = this.activePowerUps.get(playerId);
    const player = this.game.players.find(p => p.id === playerId);
    
    // Check if already active
    const existing = playerPowerUps.find(p => p.type.id === powerUpType.id);
    if (existing) {
      // Refresh duration
      existing.timeLeft = powerUpType.duration;
      return;
    }
    
    // Apply effect
    powerUpType.effect(player);
    
    // Add to active list
    playerPowerUps.push({
      type: powerUpType,
      timeLeft: powerUpType.duration
    });
  }

  removePowerUp(playerId, powerUp) {
    const player = this.game.players.find(p => p.id === playerId);
    if (player && powerUp.type.cleanup) {
      powerUp.type.cleanup(player);
    }
  }

  showPowerUpNotification(powerUpType) {
    const notification = document.createElement('div');
    notification.className = 'powerup-notification';
    notification.innerHTML = `
      <div class="powerup-icon">${powerUpType.icon}</div>
      <div class="powerup-text">
        <div class="powerup-name">${powerUpType.name}</div>
        <div class="powerup-desc">${powerUpType.description}</div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => document.body.removeChild(notification), 500);
    }, 3000);
  }

  getActivePowerUps(playerId) {
    return this.activePowerUps.get(playerId) || [];
  }

  render(ctx) {
    // Render available power-ups
    for (const powerUp of this.availablePowerUps) {
      powerUp.render(ctx);
    }
    
    // Render power-up UI
    this.renderPowerUpUI(ctx);
  }

  renderPowerUpUI(ctx) {
    const player = this.game.players[0];
    const activePowerUps = this.getActivePowerUps(player.id);
    
    if (activePowerUps.length === 0) return;
    
    ctx.save();
    
    const startX = this.game.W - 220;
    const startY = 120;
    
    for (let i = 0; i < activePowerUps.length; i++) {
      const powerUp = activePowerUps[i];
      const x = startX;
      const y = startY + i * 60;
      
      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x, y, 200, 50);
      
      // Border with power-up color
      ctx.strokeStyle = powerUp.type.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 200, 50);
      
      // Icon
      ctx.fillStyle = powerUp.type.color;
      ctx.font = '24px sans-serif';
      ctx.fillText(powerUp.type.icon, x + 8, y + 32);
      
      // Name and time
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(powerUp.type.name, x + 40, y + 20);
      
      ctx.fillStyle = '#cccccc';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${Math.ceil(powerUp.timeLeft)}s`, x + 40, y + 35);
      
      // Duration bar
      const barWidth = 150;
      const progress = powerUp.timeLeft / powerUp.type.duration;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(x + 40, y + 38, barWidth, 8);
      
      ctx.fillStyle = powerUp.type.color;
      ctx.fillRect(x + 40, y + 38, barWidth * progress, 8);
    }
    
    ctx.restore();
  }
}

class PowerUpPickup {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.size = 25;
    this.floatOffset = 0;
    this.rotationOffset = 0;
    this.lifeTime = 45; // 45 seconds before despawn
  }

  getRect() {
    return {
      x: this.x - this.size / 2,
      y: this.y - this.size / 2,
      w: this.size,
      h: this.size
    };
  }

  render(ctx) {
    ctx.save();
    
    const displayY = this.y + Math.sin(this.floatOffset) * 8;
    
    // Glow effect
    ctx.shadowColor = this.type.color;
    ctx.shadowBlur = 15;
    
    // Background circle
    ctx.fillStyle = this.type.color;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(this.x, displayY, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Icon
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.font = `${this.size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.type.icon, this.x, displayY);
    
    // Rarity border
    ctx.strokeStyle = this.getRarityColor();
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(this.x, displayY, this.size + 2, 0, Math.PI * 2);
    ctx.stroke();
    
    // Despawn warning
    if (this.lifeTime < 10) {
      ctx.globalAlpha = (Math.sin(this.lifeTime * 5) + 1) * 0.5;
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, displayY, this.size + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  getRarityColor() {
    switch (this.type.rarity) {
      case 'common': return '#9e9e9e';
      case 'uncommon': return '#4caf50';
      case 'rare': return '#2196f3';
      case 'epic': return '#9c27b0';
      case 'legendary': return '#ff9800';
      default: return '#ffffff';
    }
  }
}

// CSS for power-up notifications (to be added to styles.css)
export const powerUpStyles = `
.powerup-notification {
  position: fixed;
  top: 120px;
  left: -300px;
  width: 250px;
  background: linear-gradient(135deg, #1a237e, #3949ab);
  border: 2px solid #7986cb;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  z-index: 1000;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.powerup-notification.show {
  left: 16px;
}

.powerup-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.powerup-text {
  flex: 1;
}

.powerup-name {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 2px;
}

.powerup-desc {
  font-size: 0.8rem;
  color: #c5cae9;
  line-height: 1.2;
}
`;
