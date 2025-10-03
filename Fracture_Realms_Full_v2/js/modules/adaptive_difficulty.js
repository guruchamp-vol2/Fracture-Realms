// Adaptive Difficulty System for Fracture Realms
// Dynamically adjusts game difficulty based on player performance

export class AdaptiveDifficultySystem {
  constructor(game) {
    this.game = game;
    this.difficultyLevel = 1; // 1-10 scale
    this.baseDifficulty = 1;
    this.maxDifficulty = 10;
    
    // Performance tracking
    this.performanceMetrics = {
      // Combat metrics
      hitAccuracy: 0.8, // 80% hit rate target
      damageTaken: 0, // Total damage taken
      enemiesKilled: 0,
      deaths: 0,
      
      // Movement metrics
      platformFalls: 0,
      successfulJumps: 0,
      totalJumps: 0,
      
      // Time metrics
      stageCompletionTime: 0,
      averageReactionTime: 0,
      
      // Survival metrics
      longestSurvival: 0,
      currentSurvival: 0,
      
      // Combo metrics
      maxCombo: 0,
      averageCombo: 0,
      comboCount: 0,
      
      // Resource management
      healthPotionsUsed: 0,
      manaPotionsUsed: 0,
      shardsCollected: 0
    };
    
    // Difficulty adjustment parameters
    this.adjustmentThresholds = {
      hitAccuracy: { min: 0.6, max: 0.9, target: 0.8 },
      damageTaken: { min: 20, max: 100, target: 50 },
      deaths: { min: 0, max: 3, target: 1 },
      platformFalls: { min: 0, max: 5, target: 2 },
      completionTime: { min: 30, max: 120, target: 60 }, // seconds
      survival: { min: 60, max: 300, target: 120 }, // seconds
      combo: { min: 5, max: 25, target: 15 }
    };
    
    // Game parameters that scale with difficulty
    this.scalingParameters = {
      enemyHealth: { base: 1.0, scale: 0.2 }, // +20% per difficulty level
      enemyDamage: { base: 1.0, scale: 0.15 }, // +15% per difficulty level
      enemySpeed: { base: 1.0, scale: 0.1 }, // +10% per difficulty level
      enemySpawnRate: { base: 1.0, scale: 0.25 }, // +25% per difficulty level
      platformBreakTime: { base: 1.0, scale: -0.1 }, // -10% per difficulty level
      gravityFlipFrequency: { base: 1.0, scale: 0.2 }, // +20% per difficulty level
      timeWarpFrequency: { base: 1.0, scale: 0.15 }, // +15% per difficulty level
      hazardRiseSpeed: { base: 1.0, scale: 0.2 }, // +20% per difficulty level
      bossHealth: { base: 1.0, scale: 0.3 }, // +30% per difficulty level
      bossDamage: { base: 1.0, scale: 0.25 }, // +25% per difficulty level
      itemSpawnRate: { base: 1.0, scale: -0.1 }, // -10% per difficulty level
      shardValue: { base: 1.0, scale: 0.1 } // +10% per difficulty level
    };
    
    // Performance history for smoothing
    this.performanceHistory = [];
    this.maxHistoryLength = 10;
    
    // Adjustment intervals
    this.lastAdjustment = 0;
    this.adjustmentInterval = 30000; // 30 seconds
    
    // Difficulty change notifications
    this.difficultyChangeCallbacks = [];
    
    this.initializeTracking();
  }

  // Main per-frame update hook
  update(dt) {
    try {
      // Keep short-interval metrics flowing
      this.updatePerformanceMetrics();
      // Periodically evaluate difficulty
      this.checkDifficultyAdjustment();
    } catch (e) {
      // Never let adaptive difficulty crash the game loop
      console.warn('AdaptiveDifficulty update error:', e?.message||e);
    }
  }

  initializeTracking() {
    // Set up event listeners for performance tracking
    this.setupEventListeners();
    
    // Start performance monitoring
    this.startPerformanceMonitoring();
  }

  setupEventListeners() {
    // Track combat events
    this.game.on?.('enemyHit', (data) => {
      this.performanceMetrics.enemiesKilled++;
      this.updateHitAccuracy(true);
    });
    
    this.game.on?.('playerHit', (data) => {
      this.performanceMetrics.damageTaken += data.damage;
      this.updateHitAccuracy(false);
    });
    
    this.game.on?.('playerDeath', () => {
      this.performanceMetrics.deaths++;
      this.performanceMetrics.currentSurvival = 0;
    });
    
    // Track movement events
    this.game.on?.('platformFall', () => {
      this.performanceMetrics.platformFalls++;
    });
    
    this.game.on?.('jumpAttempt', (successful) => {
      this.performanceMetrics.totalJumps++;
      if (successful) {
        this.performanceMetrics.successfulJumps++;
      }
    });
    
    // Track combo events
    this.game.on?.('comboUpdate', (combo) => {
      this.performanceMetrics.maxCombo = Math.max(this.performanceMetrics.maxCombo, combo);
      this.updateAverageCombo(combo);
    });
    
    // Track resource usage
    this.game.on?.('itemUsed', (itemType) => {
      if (itemType === 'health_potion') {
        this.performanceMetrics.healthPotionsUsed++;
      } else if (itemType === 'mana_potion') {
        this.performanceMetrics.manaPotionsUsed++;
      }
    });
    
    this.game.on?.('shardCollected', () => {
      this.performanceMetrics.shardsCollected++;
    });
  }

  startPerformanceMonitoring() {
    // Monitor performance every second
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 1000);
    
    // Check for difficulty adjustments every 30 seconds
    setInterval(() => {
      this.checkDifficultyAdjustment();
    }, this.adjustmentInterval);
  }

  updatePerformanceMetrics() {
    const now = Date.now();
    
    // Update survival time
    if (this.game.players[0] && this.game.players[0].alive) {
      this.performanceMetrics.currentSurvival += 1;
      this.performanceMetrics.longestSurvival = Math.max(
        this.performanceMetrics.longestSurvival,
        this.performanceMetrics.currentSurvival
      );
    }
    
    // Update stage completion time
    if (this.game.stageSystem?.currentStage) {
      this.performanceMetrics.stageCompletionTime = now - this.game.stageStartTime;
    }
  }

  updateHitAccuracy(hit) {
    // Simple moving average for hit accuracy
    const currentAccuracy = this.performanceMetrics.hitAccuracy;
    const newAccuracy = hit ? 
      Math.min(1.0, currentAccuracy + 0.01) : 
      Math.max(0.0, currentAccuracy - 0.02);
    
    this.performanceMetrics.hitAccuracy = newAccuracy;
  }

  updateAverageCombo(combo) {
    this.performanceMetrics.comboCount++;
    const currentAverage = this.performanceMetrics.averageCombo;
    const newAverage = (currentAverage * (this.performanceMetrics.comboCount - 1) + combo) / this.performanceMetrics.comboCount;
    this.performanceMetrics.averageCombo = newAverage;
  }

  checkDifficultyAdjustment() {
    const now = Date.now();
    if (now - this.lastAdjustment < this.adjustmentInterval) {
      return;
    }
    
    this.lastAdjustment = now;
    
    // Calculate performance score
    const performanceScore = this.calculatePerformanceScore();
    
    // Determine if difficulty should be adjusted
    const adjustment = this.calculateDifficultyAdjustment(performanceScore);
    
    if (Math.abs(adjustment) >= 0.5) {
      this.adjustDifficulty(adjustment);
    }
    
    // Store performance in history
    this.performanceHistory.push({
      timestamp: now,
      performanceScore: performanceScore,
      difficultyLevel: this.difficultyLevel,
      metrics: { ...this.performanceMetrics }
    });
    
    // Keep only recent history
    if (this.performanceHistory.length > this.maxHistoryLength) {
      this.performanceHistory.shift();
    }
  }

  calculatePerformanceScore() {
    const metrics = this.performanceMetrics;
    const thresholds = this.adjustmentThresholds;
    
    let score = 0;
    let factors = 0;
    
    // Hit accuracy factor (0-1)
    const accuracyFactor = this.normalizeValue(
      metrics.hitAccuracy,
      thresholds.hitAccuracy.min,
      thresholds.hitAccuracy.max,
      thresholds.hitAccuracy.target
    );
    score += accuracyFactor;
    factors++;
    
    // Damage taken factor (inverted - less damage = better performance)
    const damageFactor = this.normalizeValue(
      thresholds.damageTaken.target / Math.max(metrics.damageTaken, 1),
      thresholds.damageTaken.min / thresholds.damageTaken.max,
      1.0,
      thresholds.damageTaken.target / thresholds.damageTaken.max
    );
    score += damageFactor;
    factors++;
    
    // Deaths factor (inverted - fewer deaths = better performance)
    const deathFactor = this.normalizeValue(
      Math.max(0, thresholds.deaths.max - metrics.deaths) / thresholds.deaths.max,
      0,
      1.0,
      (thresholds.deaths.max - thresholds.deaths.target) / thresholds.deaths.max
    );
    score += deathFactor;
    factors++;
    
    // Platform falls factor (inverted)
    const fallFactor = this.normalizeValue(
      Math.max(0, thresholds.platformFalls.max - metrics.platformFalls) / thresholds.platformFalls.max,
      0,
      1.0,
      (thresholds.platformFalls.max - thresholds.platformFalls.target) / thresholds.platformFalls.max
    );
    score += fallFactor;
    factors++;
    
    // Survival time factor
    const survivalFactor = this.normalizeValue(
      metrics.longestSurvival,
      thresholds.survival.min,
      thresholds.survival.max,
      thresholds.survival.target
    );
    score += survivalFactor;
    factors++;
    
    // Combo factor
    const comboFactor = this.normalizeValue(
      metrics.averageCombo,
      thresholds.combo.min,
      thresholds.combo.max,
      thresholds.combo.target
    );
    score += comboFactor;
    factors++;
    
    return factors > 0 ? score / factors : 0.5;
  }

  normalizeValue(value, min, max, target) {
    if (value <= min) return 0;
    if (value >= max) return 1;
    
    // Calculate how close the value is to the target
    const range = max - min;
    const distanceFromTarget = Math.abs(value - target);
    const maxDistance = Math.max(target - min, max - target);
    
    return 1 - (distanceFromTarget / maxDistance);
  }

  calculateDifficultyAdjustment(performanceScore) {
    // Performance score: 0 = very poor, 1 = excellent
    // Target performance: 0.6-0.7 (slightly challenging but fair)
    
    const targetPerformance = 0.65;
    const performanceDifference = performanceScore - targetPerformance;
    
    // If performance is too good, increase difficulty
    // If performance is too poor, decrease difficulty
    const adjustment = performanceDifference * 2; // Scale factor
    
    // Smooth the adjustment based on recent history
    if (this.performanceHistory.length > 0) {
      const recentPerformance = this.performanceHistory.slice(-3);
      const avgRecentPerformance = recentPerformance.reduce((sum, p) => sum + p.performanceScore, 0) / recentPerformance.length;
      const recentDifference = avgRecentPerformance - targetPerformance;
      
      // Blend current and recent performance
      const blendedAdjustment = (adjustment + recentDifference * 1.5) / 2;
      return Math.max(-2, Math.min(2, blendedAdjustment));
    }
    
    return Math.max(-2, Math.min(2, adjustment));
  }

  adjustDifficulty(adjustment) {
    const oldDifficulty = this.difficultyLevel;
    this.difficultyLevel = Math.max(1, Math.min(this.maxDifficulty, this.difficultyLevel + adjustment));
    
    if (Math.abs(this.difficultyLevel - oldDifficulty) >= 0.5) {
      this.applyDifficultyScaling();
      this.notifyDifficultyChange(oldDifficulty, this.difficultyLevel);
      this.resetPerformanceMetrics();
    }
  }

  applyDifficultyScaling() {
    const scale = this.difficultyLevel;
    const params = this.scalingParameters;
    
    // Apply scaling to game parameters
    this.game.MOD = {
      ...this.game.MOD,
      gravity: 1000 * this.getScaledValue(params.gravityFlipFrequency, scale),
      gravFlipEvery: 30000 / this.getScaledValue(params.gravityFlipFrequency, scale),
      timePulseEvery: 12000 / this.getScaledValue(params.timeWarpFrequency, scale),
      hazardRiseSpeed: 12 * this.getScaledValue(params.hazardRiseSpeed, scale)
    };
    
    // Scale enemy parameters
    if (this.game.mobSystem) {
      this.game.mobSystem.setDifficultyMultiplier(this.getScaledValue(params.enemyHealth, scale));
    }
    
    // Scale platform break time
    if (this.game.platforms) {
      this.game.platforms.forEach(platform => {
        platform.breakAt *= this.getScaledValue(params.platformBreakTime, scale);
      });
    }
    
    // Scale boss parameters
    if (this.game.boss) {
      this.game.boss.maxHP *= this.getScaledValue(params.bossHealth, scale);
      this.game.boss.damage *= this.getScaledValue(params.bossDamage, scale);
    }
    
    // Scale item spawn rates
    this.game.itemSpawnRate = this.getScaledValue(params.itemSpawnRate, scale);
    this.game.shardValue = this.getScaledValue(params.shardValue, scale);
  }

  getScaledValue(param, difficultyLevel) {
    return param.base + (param.scale * (difficultyLevel - 1));
  }

  notifyDifficultyChange(oldLevel, newLevel) {
    const change = newLevel - oldLevel;
    const direction = change > 0 ? 'increased' : 'decreased';
    const magnitude = Math.abs(change);
    
    let message = `Difficulty ${direction} to level ${Math.round(newLevel)}`;
    
    if (magnitude >= 1) {
      message += ` (${direction === 'increased' ? '⚡' : '🛡️'} ${magnitude >= 2 ? 'Significantly' : 'Moderately'})`;
    }
    
    // Show notification to player
    this.game.showNotification?.(message, 'difficulty');
    
    // Call registered callbacks
    this.difficultyChangeCallbacks.forEach(callback => {
      callback(oldLevel, newLevel, change);
    });
  }

  resetPerformanceMetrics() {
    // Reset short-term metrics but keep long-term ones
    this.performanceMetrics.damageTaken = 0;
    this.performanceMetrics.deaths = 0;
    this.performanceMetrics.platformFalls = 0;
    this.performanceMetrics.healthPotionsUsed = 0;
    this.performanceMetrics.manaPotionsUsed = 0;
    this.performanceMetrics.currentSurvival = 0;
    this.performanceMetrics.stageCompletionTime = 0;
  }

  // Public methods for external access
  getDifficultyLevel() {
    return this.difficultyLevel;
  }

  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  getPerformanceHistory() {
    return [...this.performanceHistory];
  }

  setDifficultyLevel(level) {
    const oldLevel = this.difficultyLevel;
    this.difficultyLevel = Math.max(1, Math.min(this.maxDifficulty, level));
    
    if (this.difficultyLevel !== oldLevel) {
      this.applyDifficultyScaling();
      this.notifyDifficultyChange(oldLevel, this.difficultyLevel);
    }
  }

  onDifficultyChange(callback) {
    this.difficultyChangeCallbacks.push(callback);
  }

  // Method to get difficulty description
  getDifficultyDescription() {
    const descriptions = {
      1: 'Very Easy - Perfect for beginners',
      2: 'Easy - Comfortable learning pace',
      3: 'Normal - Balanced challenge',
      4: 'Moderate - Some skill required',
      5: 'Challenging - Good reflexes needed',
      6: 'Hard - Expert level gameplay',
      7: 'Very Hard - Master level required',
      8: 'Extreme - Elite skills needed',
      9: 'Insane - Near impossible',
      10: 'Nightmare - Only for the best'
    };
    
    return descriptions[Math.round(this.difficultyLevel)] || 'Unknown';
  }

  // Method to get current performance rating
  getPerformanceRating() {
    const score = this.calculatePerformanceScore();
    
    if (score >= 0.9) return { rating: 'S+', color: '#FFD700', description: 'Perfect' };
    if (score >= 0.8) return { rating: 'S', color: '#FF6B6B', description: 'Excellent' };
    if (score >= 0.7) return { rating: 'A', color: '#4ECDC4', description: 'Great' };
    if (score >= 0.6) return { rating: 'B', color: '#45B7D1', description: 'Good' };
    if (score >= 0.5) return { rating: 'C', color: '#96CEB4', description: 'Average' };
    if (score >= 0.4) return { rating: 'D', color: '#FFEAA7', description: 'Below Average' };
    return { rating: 'F', color: '#DDA0DD', description: 'Needs Improvement' };
  }

  // Export performance data for analytics
  exportPerformanceData() {
    return {
      difficultyLevel: this.difficultyLevel,
      performanceMetrics: this.performanceMetrics,
      performanceHistory: this.performanceHistory,
      performanceRating: this.getPerformanceRating(),
      timestamp: Date.now()
    };
  }
}

export default AdaptiveDifficultySystem;
