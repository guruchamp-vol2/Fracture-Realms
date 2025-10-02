// Achievement System for Fracture Realms
// Tracks player accomplishments and unlocks rewards

export class AchievementSystem {
  constructor(game) {
    this.game = game;
    this.achievements = new Map();
    this.unlockedAchievements = new Set();
    this.statisticsTracker = new StatisticsTracker();
    
    // Load saved achievements
    this.loadProgress();
    
    // Initialize achievements
    this.initializeAchievements();
    
    // Achievement notification queue
    this.notificationQueue = [];
    this.showingNotification = false;
  }

  initializeAchievements() {
    const achievements = [
      // Combat Achievements
      {id: 'first_kill', name: 'First Blood', description: 'Defeat your first enemy', icon: '⚔️', 
       condition: (stats) => stats.enemiesKilled >= 1, reward: {shards: 5}},
      {id: 'combo_master', name: 'Combo Master', description: 'Achieve a 50 hit combo', icon: '🔥', 
       condition: (stats) => stats.maxCombo >= 50, reward: {shards: 25}},
      {id: 'boss_slayer', name: 'Boss Slayer', description: 'Defeat 5 bosses', icon: '👹', 
       condition: (stats) => stats.bossesDefeated >= 5, reward: {shards: 50, unlock: 'golden_sword'}},
      {id: 'untouchable', name: 'Untouchable', description: 'Complete a realm without taking damage', icon: '🛡️', 
       condition: (stats) => stats.perfectRealms >= 1, reward: {shards: 30, unlock: 'ghost_mode'}},
      
      // Movement Achievements  
      {id: 'speed_demon', name: 'Speed Demon', description: 'Dash 100 times in one session', icon: '💨', 
       condition: (stats) => stats.dashesUsed >= 100, reward: {shards: 20}},
      {id: 'gravity_master', name: 'Gravity Master', description: 'Survive 10 gravity flips', icon: '🌀', 
       condition: (stats) => stats.gravityFlipsSurvived >= 10, reward: {shards: 15}},
      {id: 'air_time', name: 'Air Time', description: 'Stay airborne for 30 seconds total', icon: '🕊️', 
       condition: (stats) => stats.airTimeTotal >= 30, reward: {shards: 10}},
      
      // Collection Achievements
      {id: 'collector', name: 'Crystal Collector', description: 'Collect 1000 shards', icon: '💎', 
       condition: (stats) => stats.shardsCollected >= 1000, reward: {shards: 100}},
      {id: 'hoarder', name: 'Shard Hoarder', description: 'Hold 500 shards at once', icon: '💰', 
       condition: (stats) => stats.maxShardsHeld >= 500, reward: {unlock: 'shard_magnet'}},
      
      // Survival Achievements
      {id: 'survivor', name: 'Survivor', description: 'Survive for 10 minutes straight', icon: '⏰', 
       condition: (stats) => stats.longestSurvival >= 600, reward: {shards: 35}},
      {id: 'death_defier', name: 'Death Defier', description: 'Reach 1 HP and survive 30 seconds', icon: '💔', 
       condition: (stats) => stats.lowHealthSurvival >= 30, reward: {shards: 40}},
      
      // Exploration Achievements
      {id: 'explorer', name: 'Realm Explorer', description: 'Visit all 8 realms', icon: '🗺️', 
       condition: (stats) => stats.realmsVisited >= 8, reward: {shards: 45, unlock: 'realm_map'}},
      {id: 'completionist', name: 'Completionist', description: 'Complete all realms with all upgrades', icon: '🏆', 
       condition: (stats) => stats.perfectCompletions >= 8, reward: {shards: 200, unlock: 'master_title'}},
      
      // Special Achievements
      {id: 'time_lord', name: 'Time Lord', description: 'Trigger 50 time pulses', icon: '⌚', 
       condition: (stats) => stats.timePulsesTriggered >= 50, reward: {shards: 25, unlock: 'time_control'}},
      {id: 'grapple_master', name: 'Grapple Master', description: 'Use grapple 200 times', icon: '🪝', 
       condition: (stats) => stats.grapplesUsed >= 200, reward: {shards: 30}},
      {id: 'magic_specialist', name: 'Magic Specialist', description: 'Cast 500 magic attacks', icon: '✨', 
       condition: (stats) => stats.magicAttacks >= 500, reward: {unlock: 'magic_amplifier'}},
      
      // Easter Egg Achievements
      {id: 'secret_finder', name: 'Secret Finder', description: 'Find the hidden developer room', icon: '🕵️', 
       condition: (stats) => stats.secretsFound >= 1, reward: {shards: 100, unlock: 'dev_skin'}},
      {id: 'button_masher', name: 'Button Masher', description: 'Press 10,000 inputs in one session', icon: '🎮', 
       condition: (stats) => stats.inputsPressed >= 10000, reward: {shards: 50}}
    ];

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  checkAchievements() {
    const stats = this.statisticsTracker.getStats();
    
    for (const [id, achievement] of this.achievements) {
      if (!this.unlockedAchievements.has(id) && achievement.condition(stats)) {
        this.unlockAchievement(id);
      }
    }
  }

  unlockAchievement(id) {
    const achievement = this.achievements.get(id);
    if (!achievement || this.unlockedAchievements.has(id)) return;

    this.unlockedAchievements.add(id);
    
    // Apply rewards
    if (achievement.reward) {
      if (achievement.reward.shards) {
        this.game.shardCount += achievement.reward.shards;
        this.game.campaign?.addShards?.(achievement.reward.shards);
      }
      if (achievement.reward.unlock) {
        this.unlockContent(achievement.reward.unlock);
      }
    }

    // Queue notification
    this.notificationQueue.push(achievement);
    this.showNextNotification();
    
    // Save progress
    this.saveProgress();
    
    // Play achievement sound
    this.game.audio.victory();
    
    console.log(`🏆 Achievement Unlocked: ${achievement.name}`);
  }

  unlockContent(contentId) {
    if (!this.game.unlockedContent) {
      this.game.unlockedContent = new Set();
    }
    this.game.unlockedContent.add(contentId);
    
    // Apply unlocks
    switch (contentId) {
      case 'ghost_mode':
        // Temporary invincibility power-up becomes available
        break;
      case 'shard_magnet':
        // Shards auto-collect from further distance
        break;
      case 'time_control':
        // Player can manually trigger time effects
        break;
      case 'magic_amplifier':
        // Magic attacks deal more damage
        break;
      case 'dev_skin':
        // Special developer character skin
        break;
    }
  }

  showNextNotification() {
    if (this.showingNotification || this.notificationQueue.length === 0) return;
    
    this.showingNotification = true;
    const achievement = this.notificationQueue.shift();
    
    // Create achievement notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-content">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-text">
          <div class="achievement-title">Achievement Unlocked!</div>
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-desc">${achievement.description}</div>
          ${achievement.reward?.shards ? `<div class="achievement-reward">+${achievement.reward.shards} shards</div>` : ''}
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
        this.showingNotification = false;
        this.showNextNotification(); // Show next in queue
      }, 500);
    }, 4000);
  }

  getProgress() {
    const total = this.achievements.size;
    const unlocked = this.unlockedAchievements.size;
    return { unlocked, total, percentage: Math.round((unlocked / total) * 100) };
  }

  getUnlockedAchievements() {
    return Array.from(this.unlockedAchievements).map(id => this.achievements.get(id));
  }

  saveProgress() {
    try {
      const data = {
        unlockedAchievements: Array.from(this.unlockedAchievements),
        statistics: this.statisticsTracker.getStats()
      };
      localStorage.setItem('fracture_realms_achievements', JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save achievement progress:', e);
    }
  }

  loadProgress() {
    try {
      const data = JSON.parse(localStorage.getItem('fracture_realms_achievements') || '{}');
      if (data.unlockedAchievements) {
        this.unlockedAchievements = new Set(data.unlockedAchievements);
      }
      if (data.statistics) {
        this.statisticsTracker.loadStats(data.statistics);
      }
    } catch (e) {
      console.warn('Could not load achievement progress:', e);
    }
  }

  // Event tracking methods
  trackEnemyKill() { this.statisticsTracker.incrementStat('enemiesKilled'); }
  trackBossDefeat() { this.statisticsTracker.incrementStat('bossesDefeated'); }
  trackDash() { this.statisticsTracker.incrementStat('dashesUsed'); }
  trackGrapple() { this.statisticsTracker.incrementStat('grapplesUsed'); }
  trackMagicAttack() { this.statisticsTracker.incrementStat('magicAttacks'); }
  trackShardCollection(amount = 1) { 
    this.statisticsTracker.incrementStat('shardsCollected', amount);
    this.statisticsTracker.setStat('maxShardsHeld', Math.max(
      this.statisticsTracker.getStat('maxShardsHeld'),
      this.game.shardCount
    ));
  }
  trackCombo(combo) { 
    this.statisticsTracker.setStat('maxCombo', Math.max(
      this.statisticsTracker.getStat('maxCombo'),
      combo
    ));
  }
  trackInput() { this.statisticsTracker.incrementStat('inputsPressed'); }
  trackAirTime(deltaTime) { this.statisticsTracker.incrementStat('airTimeTotal', deltaTime); }
  trackSurvivalTime(time) { 
    this.statisticsTracker.setStat('longestSurvival', Math.max(
      this.statisticsTracker.getStat('longestSurvival'),
      time
    ));
  }
}

class StatisticsTracker {
  constructor() {
    this.stats = {
      enemiesKilled: 0,
      bossesDefeated: 0,
      maxCombo: 0,
      perfectRealms: 0,
      dashesUsed: 0,
      gravityFlipsSurvived: 0,
      airTimeTotal: 0,
      shardsCollected: 0,
      maxShardsHeld: 0,
      longestSurvival: 0,
      lowHealthSurvival: 0,
      realmsVisited: 0,
      perfectCompletions: 0,
      timePulsesTriggered: 0,
      grapplesUsed: 0,
      magicAttacks: 0,
      secretsFound: 0,
      inputsPressed: 0
    };
  }

  incrementStat(statName, amount = 1) {
    if (this.stats.hasOwnProperty(statName)) {
      this.stats[statName] += amount;
    }
  }

  setStat(statName, value) {
    if (this.stats.hasOwnProperty(statName)) {
      this.stats[statName] = value;
    }
  }

  getStat(statName) {
    return this.stats[statName] || 0;
  }

  getStats() {
    return { ...this.stats };
  }

  loadStats(savedStats) {
    this.stats = { ...this.stats, ...savedStats };
  }
}

// CSS for achievement notifications (to be added to styles.css)
export const achievementStyles = `
.achievement-notification {
  position: fixed;
  top: 80px;
  right: -400px;
  width: 350px;
  background: linear-gradient(135deg, #1a237e, #3949ab);
  border: 2px solid #7986cb;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  z-index: 1000;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  backdrop-filter: blur(10px);
}

.achievement-notification.show {
  right: 16px;
}

.achievement-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.achievement-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.achievement-text {
  flex: 1;
}

.achievement-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #e8eaf6;
  margin-bottom: 4px;
}

.achievement-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.achievement-desc {
  font-size: 0.85rem;
  color: #c5cae9;
  line-height: 1.3;
}

.achievement-reward {
  font-size: 0.8rem;
  color: #81c784;
  font-weight: 600;
  margin-top: 4px;
}
`;
