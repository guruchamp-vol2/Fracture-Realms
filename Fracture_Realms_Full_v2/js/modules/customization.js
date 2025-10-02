// Character Customization System for Fracture Realms
// Unlockable skins, appearances, and visual customization

export class CustomizationSystem {
  constructor(game) {
    this.game = game;
    this.unlockedContent = new Set();
    this.currentSkin = 'default';
    this.currentTrail = 'default';
    this.currentAura = 'none';
    this.currentWeapon = 'sword';
    
    this.customizationData = {
      skins: {
        default: {
          id: 'default',
          name: 'Default Warrior',
          description: 'The classic appearance',
          rarity: 'common',
          unlocked: true,
          cost: 0,
          colors: {
            primary: '#90caf9',
            secondary: '#64b5f6',
            accent: '#42a5f5'
          },
          effects: []
        },
        
        shadow: {
          id: 'shadow',
          name: 'Shadow Assassin',
          description: 'Moves like a shadow through the realms',
          rarity: 'rare',
          unlocked: false,
          cost: 50,
          colors: {
            primary: '#424242',
            secondary: '#212121',
            accent: '#757575'
          },
          effects: ['shadow_trail', 'stealth_aura']
        },
        
        fire: {
          id: 'fire',
          name: 'Flame Warrior',
          description: 'Burns with the fury of the Ember Vault',
          rarity: 'epic',
          unlocked: false,
          cost: 100,
          colors: {
            primary: '#ff5722',
            secondary: '#d84315',
            accent: '#ff9800'
          },
          effects: ['fire_trail', 'flame_aura', 'ember_particles']
        },
        
        ice: {
          id: 'ice',
          name: 'Frost Guardian',
          description: 'Cold as the Glacier Chasm',
          rarity: 'epic',
          unlocked: false,
          cost: 100,
          colors: {
            primary: '#81d4fa',
            secondary: '#4fc3f7',
            accent: '#29b6f6'
          },
          effects: ['ice_trail', 'frost_aura', 'snow_particles']
        },
        
        lightning: {
          id: 'lightning',
          name: 'Storm Caller',
          description: 'Channels the power of the tempest',
          rarity: 'legendary',
          unlocked: false,
          cost: 200,
          colors: {
            primary: '#ffeb3b',
            secondary: '#ffc107',
            accent: '#ff9800'
          },
          effects: ['lightning_trail', 'electric_aura', 'spark_particles']
        },
        
        cosmic: {
          id: 'cosmic',
          name: 'Star Walker',
          description: 'Born from the void between realms',
          rarity: 'legendary',
          unlocked: false,
          cost: 300,
          colors: {
            primary: '#e1bee7',
            secondary: '#ce93d8',
            accent: '#ba68c8'
          },
          effects: ['cosmic_trail', 'star_aura', 'nebula_particles']
        },
        
        golden: {
          id: 'golden',
          name: 'Golden Champion',
          description: 'Achieved through mastery of all realms',
          rarity: 'legendary',
          unlocked: false,
          cost: 500,
          colors: {
            primary: '#ffd700',
            secondary: '#ffc107',
            accent: '#ff9800'
          },
          effects: ['gold_trail', 'divine_aura', 'light_particles']
        }
      },
      
      trails: {
        default: {
          id: 'default',
          name: 'Standard Trail',
          description: 'Basic movement trail',
          rarity: 'common',
          unlocked: true,
          cost: 0
        },
        
        rainbow: {
          id: 'rainbow',
          name: 'Rainbow Trail',
          description: 'A colorful trail of light',
          rarity: 'uncommon',
          unlocked: false,
          cost: 25
        },
        
        energy: {
          id: 'energy',
          name: 'Energy Trail',
          description: 'Crackling energy follows your path',
          rarity: 'rare',
          unlocked: false,
          cost: 50
        },
        
        shadow: {
          id: 'shadow',
          name: 'Shadow Trail',
          description: 'Dark energy trails behind you',
          rarity: 'rare',
          unlocked: false,
          cost: 50
        },
        
        fire: {
          id: 'fire',
          name: 'Flame Trail',
          description: 'Burning embers mark your path',
          rarity: 'epic',
          unlocked: false,
          cost: 100
        },
        
        ice: {
          id: 'ice',
          name: 'Frost Trail',
          description: 'Ice crystals form in your wake',
          rarity: 'epic',
          unlocked: false,
          cost: 100
        },
        
        lightning: {
          id: 'lightning',
          name: 'Lightning Trail',
          description: 'Electric sparks dance behind you',
          rarity: 'legendary',
          unlocked: false,
          cost: 200
        }
      },
      
      auras: {
        none: {
          id: 'none',
          name: 'No Aura',
          description: 'No special aura effect',
          rarity: 'common',
          unlocked: true,
          cost: 0
        },
        
        power: {
          id: 'power',
          name: 'Power Aura',
          description: 'A subtle energy field',
          rarity: 'uncommon',
          unlocked: false,
          cost: 30
        },
        
        stealth: {
          id: 'stealth',
          name: 'Stealth Aura',
          description: 'Semi-transparent effect',
          rarity: 'rare',
          unlocked: false,
          cost: 60
        },
        
        flame: {
          id: 'flame',
          name: 'Flame Aura',
          description: 'Flickering flames surround you',
          rarity: 'epic',
          unlocked: false,
          cost: 120
        },
        
        frost: {
          id: 'frost',
          name: 'Frost Aura',
          description: 'Crystalline ice formations',
          rarity: 'epic',
          unlocked: false,
          cost: 120
        },
        
        divine: {
          id: 'divine',
          name: 'Divine Aura',
          description: 'Golden light emanates from you',
          rarity: 'legendary',
          unlocked: false,
          cost: 250
        }
      },
      
      weapons: {
        sword: {
          id: 'sword',
          name: 'Iron Sword',
          description: 'A reliable blade',
          rarity: 'common',
          unlocked: true,
          cost: 0
        },
        
        shadow_blade: {
          id: 'shadow_blade',
          name: 'Shadow Blade',
          description: 'Forged in the darkness',
          rarity: 'rare',
          unlocked: false,
          cost: 75
        },
        
        flame_sword: {
          id: 'flame_sword',
          name: 'Flame Sword',
          description: 'Burns with eternal fire',
          rarity: 'epic',
          unlocked: false,
          cost: 150
        },
        
        ice_blade: {
          id: 'ice_blade',
          name: 'Ice Blade',
          description: 'Frozen to absolute zero',
          rarity: 'epic',
          unlocked: false,
          cost: 150
        },
        
        lightning_rod: {
          id: 'lightning_rod',
          name: 'Lightning Rod',
          description: 'Channels the power of storms',
          rarity: 'legendary',
          unlocked: false,
          cost: 300
        }
      }
    };
    
    this.loadCustomization();
  }

  unlockContent(contentId) {
    this.unlockedContent.add(contentId);
    this.saveCustomization();
    
    // Show unlock notification
    this.showUnlockNotification(contentId);
    
    this.game.log(`Unlocked: ${this.getContentName(contentId)}`, 'ok');
  }

  getContentName(contentId) {
    // Search through all content types
    for (const category of Object.values(this.customizationData)) {
      if (category[contentId]) {
        return category[contentId].name;
      }
    }
    return contentId;
  }

  showUnlockNotification(contentId) {
    const notification = document.createElement('div');
    notification.className = 'unlock-notification';
    notification.innerHTML = `
      <div class="unlock-content">
        <div class="unlock-icon">🎉</div>
        <div class="unlock-text">
          <div class="unlock-title">New Unlock!</div>
          <div class="unlock-name">${this.getContentName(contentId)}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => document.body.removeChild(notification), 500);
    }, 3000);
  }

  equipSkin(skinId) {
    if (!this.isUnlocked(skinId)) {
      this.game.log('Skin not unlocked!', 'warn');
      return false;
    }
    
    this.currentSkin = skinId;
    this.applySkinEffects(skinId);
    this.saveCustomization();
    
    this.game.log(`Equipped skin: ${this.customizationData.skins[skinId].name}`, 'ok');
    return true;
  }

  equipTrail(trailId) {
    if (!this.isUnlocked(trailId)) {
      this.game.log('Trail not unlocked!', 'warn');
      return false;
    }
    
    this.currentTrail = trailId;
    this.saveCustomization();
    
    this.game.log(`Equipped trail: ${this.customizationData.trails[trailId].name}`, 'ok');
    return true;
  }

  equipAura(auraId) {
    if (!this.isUnlocked(auraId)) {
      this.game.log('Aura not unlocked!', 'warn');
      return false;
    }
    
    this.currentAura = auraId;
    this.saveCustomization();
    
    this.game.log(`Equipped aura: ${this.customizationData.auras[auraId].name}`, 'ok');
    return true;
  }

  equipWeapon(weaponId) {
    if (!this.isUnlocked(weaponId)) {
      this.game.log('Weapon not unlocked!', 'warn');
      return false;
    }
    
    this.currentWeapon = weaponId;
    this.saveCustomization();
    
    this.game.log(`Equipped weapon: ${this.customizationData.weapons[weaponId].name}`, 'ok');
    return true;
  }

  isUnlocked(contentId) {
    return this.unlockedContent.has(contentId) || this.customizationData.skins[contentId]?.unlocked;
  }

  applySkinEffects(skinId) {
    const skin = this.customizationData.skins[skinId];
    if (!skin) return;
    
    // Apply color scheme to player
    const player = this.game.players[0];
    player.skinColors = skin.colors;
    player.skinEffects = skin.effects;
    
    // Apply visual effects
    skin.effects.forEach(effect => {
      this.applySkinEffect(effect, player);
    });
  }

  applySkinEffect(effect, player) {
    switch (effect) {
      case 'shadow_trail':
        player.shadowTrail = true;
        break;
        
      case 'stealth_aura':
        player.stealthAura = true;
        break;
        
      case 'fire_trail':
        player.fireTrail = true;
        break;
        
      case 'flame_aura':
        player.flameAura = true;
        break;
        
      case 'ember_particles':
        player.emberParticles = true;
        break;
        
      case 'ice_trail':
        player.iceTrail = true;
        break;
        
      case 'frost_aura':
        player.frostAura = true;
        break;
        
      case 'snow_particles':
        player.snowParticles = true;
        break;
        
      case 'lightning_trail':
        player.lightningTrail = true;
        break;
        
      case 'electric_aura':
        player.electricAura = true;
        break;
        
      case 'spark_particles':
        player.sparkParticles = true;
        break;
        
      case 'cosmic_trail':
        player.cosmicTrail = true;
        break;
        
      case 'star_aura':
        player.starAura = true;
        break;
        
      case 'nebula_particles':
        player.nebulaParticles = true;
        break;
        
      case 'gold_trail':
        player.goldTrail = true;
        break;
        
      case 'divine_aura':
        player.divineAura = true;
        break;
        
      case 'light_particles':
        player.lightParticles = true;
        break;
    }
  }

  updatePlayerVisuals(player, deltaTime) {
    // Update trail effects
    if (player.vel.x !== 0 || player.vel.y !== 0) {
      this.createTrailEffect(player);
    }
    
    // Update aura effects
    this.updateAuraEffect(player, deltaTime);
    
    // Update particle effects
    this.updateParticleEffects(player, deltaTime);
  }

  createTrailEffect(player) {
    const trail = this.customizationData.trails[this.currentTrail];
    if (!trail || trail.id === 'default') return;
    
    switch (trail.id) {
      case 'rainbow':
        this.game.particleSystem?.createTrail(player.pos.x, player.pos.y, player.facing, {
          color: `hsl(${(performance.now() * 0.1) % 360}, 70%, 50%)`,
          count: 3,
          size: 2
        });
        break;
        
      case 'energy':
        this.game.particleSystem?.createTrail(player.pos.x, player.pos.y, player.facing, {
          color: '#64b5f6',
          count: 5,
          size: 3
        });
        break;
        
      case 'shadow':
        this.game.particleSystem?.createTrail(player.pos.x, player.pos.y, player.facing, {
          color: '#424242',
          count: 4,
          size: 2
        });
        break;
        
      case 'fire':
        this.game.particleSystem?.createTrail(player.pos.x, player.pos.y, player.facing, {
          color: '#ff5722',
          count: 6,
          size: 3
        });
        break;
        
      case 'ice':
        this.game.particleSystem?.createTrail(player.pos.x, player.pos.y, player.facing, {
          color: '#81d4fa',
          count: 4,
          size: 2
        });
        break;
        
      case 'lightning':
        this.game.particleSystem?.createTrail(player.pos.x, player.pos.y, player.facing, {
          color: '#ffeb3b',
          count: 8,
          size: 2
        });
        break;
    }
  }

  updateAuraEffect(player, deltaTime) {
    const aura = this.customizationData.auras[this.currentAura];
    if (!aura || aura.id === 'none') return;
    
    // Create aura particles periodically
    if (Math.random() < 0.1) {
      this.createAuraParticles(player, aura.id);
    }
  }

  createAuraParticles(player, auraId) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 40 + Math.random() * 20;
    const x = player.pos.x + Math.cos(angle) * radius;
    const y = player.pos.y + Math.sin(angle) * radius;
    
    switch (auraId) {
      case 'power':
        this.game.particleSystem?.createMagicSparkles(x, y, {
          color: '#64b5f6',
          count: 3,
          size: 2
        });
        break;
        
      case 'stealth':
        this.game.particleSystem?.createSmoke(x, y, {
          color: 'rgba(100, 100, 100, 0.3)',
          count: 2,
          size: 4
        });
        break;
        
      case 'flame':
        this.game.particleSystem?.createTrail(x, y, 1, {
          color: '#ff5722',
          count: 4,
          size: 3
        });
        break;
        
      case 'frost':
        this.game.particleSystem?.createShardGlitter(x, y, {
          color: '#81d4fa',
          count: 3,
          size: 2
        });
        break;
        
      case 'divine':
        this.game.particleSystem?.createMagicSparkles(x, y, {
          color: '#ffd700',
          count: 5,
          size: 3
        });
        break;
    }
  }

  updateParticleEffects(player, deltaTime) {
    // Update skin-specific particle effects
    if (player.emberParticles && Math.random() < 0.05) {
      this.game.particleSystem?.createTrail(player.pos.x, player.pos.y, player.facing, {
        color: '#ff5722',
        count: 2,
        size: 1
      });
    }
    
    if (player.snowParticles && Math.random() < 0.03) {
      this.game.particleSystem?.createShardGlitter(player.pos.x, player.pos.y, {
        color: '#ffffff',
        count: 1,
        size: 1
      });
    }
    
    if (player.sparkParticles && Math.random() < 0.08) {
      this.game.particleSystem?.createMagicSparkles(player.pos.x, player.pos.y, {
        color: '#ffeb3b',
        count: 2,
        size: 1
      });
    }
  }

  renderCustomizationUI(ctx) {
    // Render customization status
    const x = 20;
    const y = this.game.H - 200;
    
    ctx.save();
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, 250, 150);
    
    ctx.strokeStyle = '#64b5f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 250, 150);
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Customization', x + 8, y + 20);
    
    // Current items
    const skin = this.customizationData.skins[this.currentSkin];
    const trail = this.customizationData.trails[this.currentTrail];
    const aura = this.customizationData.auras[this.currentAura];
    
    ctx.fillStyle = '#cccccc';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Skin: ${skin?.name || 'Unknown'}`, x + 8, y + 40);
    ctx.fillText(`Trail: ${trail?.name || 'Unknown'}`, x + 8, y + 60);
    ctx.fillText(`Aura: ${aura?.name || 'Unknown'}`, x + 8, y + 80);
    
    // Unlocked count
    const totalUnlocked = this.unlockedContent.size;
    const totalContent = Object.values(this.customizationData).reduce((sum, category) => 
      sum + Object.keys(category).length, 0);
    
    ctx.fillText(`Unlocked: ${totalUnlocked}/${totalContent}`, x + 8, y + 100);
    
    // Progress bar
    const progress = totalUnlocked / totalContent;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x + 8, y + 110, 230, 8);
    
    ctx.fillStyle = '#64b5f6';
    ctx.fillRect(x + 8, y + 110, 230 * progress, 8);
    
    ctx.restore();
  }

  saveCustomization() {
    try {
      const data = {
        unlockedContent: Array.from(this.unlockedContent),
        currentSkin: this.currentSkin,
        currentTrail: this.currentTrail,
        currentAura: this.currentAura,
        currentWeapon: this.currentWeapon
      };
      localStorage.setItem('fracture_realms_customization', JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save customization:', e);
    }
  }

  loadCustomization() {
    try {
      const saved = localStorage.getItem('fracture_realms_customization');
      if (saved) {
        const data = JSON.parse(saved);
        this.unlockedContent = new Set(data.unlockedContent || []);
        this.currentSkin = data.currentSkin || 'default';
        this.currentTrail = data.currentTrail || 'default';
        this.currentAura = data.currentAura || 'none';
        this.currentWeapon = data.currentWeapon || 'sword';
        
        // Apply current customization
        this.equipSkin(this.currentSkin);
        this.equipTrail(this.currentTrail);
        this.equipAura(this.currentAura);
        this.equipWeapon(this.currentWeapon);
      }
    } catch (e) {
      console.warn('Could not load customization:', e);
    }
  }
}

// CSS for customization UI (to be added to styles.css)
export const customizationStyles = `
.unlock-notification {
  position: fixed;
  top: 100px;
  right: -300px;
  width: 250px;
  background: linear-gradient(135deg, #2e7d32, #4caf50);
  border: 2px solid #66bb6a;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  z-index: 1000;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.unlock-notification.show {
  right: 16px;
}

.unlock-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.unlock-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.unlock-text {
  flex: 1;
}

.unlock-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #c8e6c9;
  margin-bottom: 2px;
}

.unlock-name {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
}
`;
