// Dynamic Difficulty System for Fracture Realms
// Adaptive challenge scaling and difficulty modes

export class DifficultySystem {
  constructor(game) {
    this.game = game;
    this.currentDifficulty = 'normal';
    this.adaptiveMode = false;
    this.playerPerformance = {
      deaths: 0,
      kills: 0,
      survivalTime: 0,
      damageTaken: 0,
      combos: 0,
      accuracy: 0
    };
    
    this.difficultySettings = {
      easy: {
        name: 'Easy',
        description: 'Relaxed gameplay for beginners',
        enemyHealth: 0.7,
        enemyDamage: 0.5,
        enemySpeed: 0.8,
        enemySpawnRate: 0.6,
        playerHealth: 1.5,
        playerDamage: 1.2,
        gravityFlipTime: 1.5,
        timePulseFrequency: 0.7,
        platformBreakTime: 1.5,
        bossHealth: 0.6,
        bossDamage: 0.6,
        hazardSpeed: 0.7,
        shardValue: 1.5,
        assistMode: true
      },
      
      normal: {
        name: 'Normal',
        description: 'Balanced challenge for most players',
        enemyHealth: 1.0,
        enemyDamage: 1.0,
        enemySpeed: 1.0,
        enemySpawnRate: 1.0,
        playerHealth: 1.0,
        playerDamage: 1.0,
        gravityFlipTime: 1.0,
        timePulseFrequency: 1.0,
        platformBreakTime: 1.0,
        bossHealth: 1.0,
        bossDamage: 1.0,
        hazardSpeed: 1.0,
        shardValue: 1.0,
        assistMode: false
      },
      
      hard: {
        name: 'Hard',
        description: 'Increased challenge for experienced players',
        enemyHealth: 1.4,
        enemyDamage: 1.3,
        enemySpeed: 1.2,
        enemySpawnRate: 1.3,
        playerHealth: 0.8,
        playerDamage: 0.9,
        gravityFlipTime: 0.7,
        timePulseFrequency: 1.3,
        platformBreakTime: 0.7,
        bossHealth: 1.3,
        bossDamage: 1.2,
        hazardSpeed: 1.3,
        shardValue: 0.8,
        assistMode: false
      },
      
      nightmare: {
        name: 'Nightmare',
        description: 'Extreme challenge for masochists',
        enemyHealth: 2.0,
        enemyDamage: 1.8,
        enemySpeed: 1.5,
        enemySpawnRate: 1.8,
        playerHealth: 0.6,
        playerDamage: 0.8,
        gravityFlipTime: 0.5,
        timePulseFrequency: 1.8,
        platformBreakTime: 0.5,
        bossHealth: 1.8,
        bossDamage: 1.6,
        hazardSpeed: 1.6,
        shardValue: 0.6,
        assistMode: false,
        specialEffects: true
      }
    };
    
    this.applyDifficulty('normal');
  }

  setDifficulty(difficulty) {
    if (!this.difficultySettings[difficulty]) {
      console.warn(`Unknown difficulty: ${difficulty}`);
      return;
    }
    
    this.currentDifficulty = difficulty;
    this.applyDifficulty(difficulty);
    
    this.game.log(`Difficulty set to: ${this.difficultySettings[difficulty].name}`, 'ok');
  }

  applyDifficulty(difficulty) {
    const settings = this.difficultySettings[difficulty];
    
    // Apply to game systems
    this.game.difficultySettings = settings;
    
    // Update player stats
    for (const player of this.game.players) {
      if (player.enabled) {
        player.maxHP = Math.floor(100 * settings.playerHealth);
        player.hp = player.maxHP;
        player.damageMult = settings.playerDamage;
      }
    }
    
    // Update game modifiers
    this.game.MOD.gravFlipEvery = (this.game.MOD.gravFlipEvery || 30000) * settings.gravityFlipTime;
    this.game.MOD.timePulseEvery = (this.game.MOD.timePulseEvery || 12000) * settings.timePulseFrequency;
    this.game.MOD.hazardRiseSpeed = (this.game.MOD.hazardRiseSpeed || 12) * settings.hazardSpeed;
    
    // Update assist mode
    this.game.assist = settings.assistMode;
    
    // Apply special effects for nightmare mode
    if (settings.specialEffects) {
      this.enableNightmareEffects();
    } else {
      this.disableNightmareEffects();
    }
  }

  enableNightmareEffects() {
    // Add visual effects for nightmare mode
    this.game.nightmareMode = true;
    
    // Enhanced particle effects
    this.game.particleSystem?.createEnergyField(
      this.game.W / 2, 
      this.game.H / 2, 
      Math.max(this.game.W, this.game.H) / 2,
      {
        rate: 10,
        life: 999,
        particleOptions: {
          color: '#ff1744',
          size: 3,
          life: 2.0,
          orbital: true,
          orbitRadius: 100
        }
      }
    );
  }

  disableNightmareEffects() {
    this.game.nightmareMode = false;
  }

  enableAdaptiveMode() {
    this.adaptiveMode = true;
    this.game.log('Adaptive difficulty enabled', 'ok');
  }

  updateAdaptiveDifficulty(deltaTime) {
    if (!this.adaptiveMode) return;
    
    // Analyze player performance
    const performance = this.analyzePerformance();
    
    // Adjust difficulty based on performance
    if (performance < 0.3) {
      // Player struggling - make easier
      this.adjustDifficulty(-0.1);
    } else if (performance > 0.8) {
      // Player doing well - make harder
      this.adjustDifficulty(0.1);
    }
  }

  analyzePerformance() {
    const stats = this.playerPerformance;
    const totalTime = stats.survivalTime;
    
    if (totalTime === 0) return 0.5;
    
    // Calculate performance score (0-1)
    const deathRate = stats.deaths / Math.max(1, totalTime / 60); // deaths per minute
    const killRate = stats.kills / Math.max(1, totalTime / 60); // kills per minute
    const damageRate = stats.damageTaken / Math.max(1, totalTime / 60); // damage per minute
    
    // Normalize scores
    const deathScore = Math.max(0, 1 - deathRate * 2); // Lower deaths = better
    const killScore = Math.min(1, killRate / 10); // Higher kills = better
    const damageScore = Math.max(0, 1 - damageRate / 50); // Lower damage = better
    
    return (deathScore + killScore + damageScore) / 3;
  }

  adjustDifficulty(adjustment) {
    const currentSettings = this.difficultySettings[this.currentDifficulty];
    
    // Apply gradual adjustments
    Object.keys(currentSettings).forEach(key => {
      if (typeof currentSettings[key] === 'number' && key !== 'playerHealth') {
        currentSettings[key] = Math.max(0.1, Math.min(3.0, currentSettings[key] + adjustment));
      }
    });
    
    this.applyDifficulty(this.currentDifficulty);
  }

  trackPlayerDeath() {
    this.playerPerformance.deaths++;
  }

  trackEnemyKill() {
    this.playerPerformance.kills++;
  }

  trackDamageTaken(amount) {
    this.playerPerformance.damageTaken += amount;
  }

  trackSurvivalTime(deltaTime) {
    this.playerPerformance.survivalTime += deltaTime;
  }

  trackCombo(combo) {
    this.playerPerformance.combos = Math.max(this.playerPerformance.combos, combo);
  }

  // Difficulty-specific events
  triggerDifficultyEvent(eventType) {
    const settings = this.difficultySettings[this.currentDifficulty];
    
    switch (eventType) {
      case 'bossSpawn':
        if (settings.specialEffects) {
          this.triggerNightmareBossSpawn();
        }
        break;
        
      case 'gravityFlip':
        if (this.currentDifficulty === 'nightmare') {
          this.triggerNightmareGravityFlip();
        }
        break;
        
      case 'timePulse':
        if (this.currentDifficulty === 'hard' || this.currentDifficulty === 'nightmare') {
          this.triggerEnhancedTimePulse();
        }
        break;
    }
  }

  triggerNightmareBossSpawn() {
    // Spawn additional hazards
    for (let i = 0; i < 3; i++) {
      this.game.enemies.push(new this.game.Enemy(
        Math.random() * this.game.W,
        Math.random() * this.game.H * 0.5,
        'nightmare'
      ));
    }
    
    // Create energy field
    this.game.particleSystem?.createEnergyField(
      this.game.W / 2,
      this.game.H / 2,
      200,
      {
        rate: 15,
        life: 10,
        particleOptions: {
          color: '#ff1744',
          size: 4,
          life: 1.5,
          orbital: true
        }
      }
    );
  }

  triggerNightmareGravityFlip() {
    // Enhanced gravity flip effects
    this.game.particleSystem?.createExplosion(
      this.game.W / 2,
      this.game.H / 2,
      {
        color: '#9c27b0',
        count: 50,
        speed: 400
      }
    );
    
    // Screen shake
    this.game.shake(15, 500);
  }

  triggerEnhancedTimePulse() {
    // More dramatic time effects
    const timeScale = this.currentDifficulty === 'nightmare' ? 0.3 : 0.5;
    this.game.pulseTo(timeScale);
    
    // Visual distortion
    this.game.particleSystem?.createMagicSparkles(
      this.game.W / 2,
      this.game.H / 2,
      {
        count: 30,
        colors: ['#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc']
      }
    );
  }

  // Difficulty-based rewards
  getDifficultyMultiplier() {
    const multipliers = {
      easy: 0.8,
      normal: 1.0,
      hard: 1.3,
      nightmare: 2.0
    };
    return multipliers[this.currentDifficulty] || 1.0;
  }

  getDifficultyBonus() {
    const bonuses = {
      easy: 0,
      normal: 0,
      hard: 500,
      nightmare: 2000
    };
    return bonuses[this.currentDifficulty] || 0;
  }

  renderDifficultyUI(ctx) {
    ctx.save();
    
    const x = this.game.W - 200;
    const y = 20;
    
    // Difficulty indicator
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, 180, 40);
    
    const difficulty = this.difficultySettings[this.currentDifficulty];
    const color = this.getDifficultyColor();
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 180, 40);
    
    // Difficulty name
    ctx.fillStyle = color;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(difficulty.name, x + 8, y + 18);
    
    // Difficulty description
    ctx.fillStyle = '#cccccc';
    ctx.font = '10px sans-serif';
    ctx.fillText(difficulty.description, x + 8, y + 32);
    
    // Adaptive mode indicator
    if (this.adaptiveMode) {
      ctx.fillStyle = '#4caf50';
      ctx.font = '10px sans-serif';
      ctx.fillText('ADAPTIVE', x + 8, y + 45);
    }
    
    ctx.restore();
  }

  getDifficultyColor() {
    const colors = {
      easy: '#4caf50',
      normal: '#2196f3',
      hard: '#ff9800',
      nightmare: '#f44336'
    };
    return colors[this.currentDifficulty] || '#ffffff';
  }

  // Reset performance tracking
  resetPerformance() {
    this.playerPerformance = {
      deaths: 0,
      kills: 0,
      survivalTime: 0,
      damageTaken: 0,
      combos: 0,
      accuracy: 0
    };
  }
}

// CSS for difficulty UI (to be added to styles.css)
export const difficultyStyles = `
.difficulty-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #64b5f6;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: bold;
  color: #ffffff;
  z-index: 100;
}

.difficulty-easy { border-color: #4caf50; }
.difficulty-normal { border-color: #2196f3; }
.difficulty-hard { border-color: #ff9800; }
.difficulty-nightmare { border-color: #f44336; }
`;
