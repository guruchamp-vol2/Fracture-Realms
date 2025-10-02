// Scoring and Leaderboard System for Fracture Realms

export class ScoringSystem {
  constructor(game) {
    this.game = game;
    this.currentScore = 0;
    this.scoreMultiplier = 1.0;
    this.multiplierTimer = 0;
    this.scoringHistory = [];
    
    // Score values
    this.scoreValues = {
      enemyKill: 100,
      bossKill: 1000,
      comboHit: 50,
      shardCollect: 10,
      timeSurvived: 1, // per second
      perfectRealm: 5000,
      stylishKill: 200,
      airKill: 150,
      doubleKill: 300,
      tripleKill: 500,
      multiKill: 1000,
      noHitBonus: 2000,
      speedBonus: 1500
    };
    
    this.killStreak = 0;
    this.killStreakTimer = 0;
    this.lastKillTime = 0;
    this.recentKills = [];
    
    this.sessionStartTime = performance.now();
  }

  addScore(type, multiplier = 1, showPopup = true) {
    const baseScore = this.scoreValues[type] || 0;
    const finalScore = Math.floor(baseScore * multiplier * this.scoreMultiplier);
    
    this.currentScore += finalScore;
    
    if (showPopup && finalScore > 0) {
      this.showScorePopup(finalScore, type);
    }
    
    // Update multiplier timer for certain actions
    if (['enemyKill', 'bossKill', 'comboHit'].includes(type)) {
      this.multiplierTimer = 5.0; // 5 seconds
      this.scoreMultiplier = Math.min(5.0, this.scoreMultiplier + 0.1);
    }
    
    // Track for leaderboard
    this.recordScoreEvent(type, finalScore);
    
    return finalScore;
  }

  trackKill(enemy, player) {
    const now = performance.now();
    this.killStreak++;
    this.killStreakTimer = 3.0;
    
    // Track recent kills for multi-kill detection
    this.recentKills.push(now);
    this.recentKills = this.recentKills.filter(time => now - time < 2000);
    
    // Base kill score
    let scoreType = 'enemyKill';
    let multiplier = 1;
    
    // Bonus for airborne kills
    if (!player.onGround) {
      scoreType = 'airKill';
      multiplier *= 1.5;
    }
    
    // Bonus for stylish kills (high combo)
    if (player.combo > 10) {
      scoreType = 'stylishKill';
      multiplier *= 1.5;
    }
    
    // Multi-kill bonuses
    if (this.recentKills.length >= 5) {
      this.addScore('multiKill', 1, true);
    } else if (this.recentKills.length >= 3) {
      this.addScore('tripleKill', 1, true);
    } else if (this.recentKills.length >= 2) {
      this.addScore('doubleKill', 1, true);
    }
    
    // Kill streak bonus
    if (this.killStreak >= 10) {
      multiplier *= 2.0;
    } else if (this.killStreak >= 5) {
      multiplier *= 1.5;
    }
    
    this.addScore(scoreType, multiplier);
    
    // Achievement tracking
    this.game.achievements?.trackEnemyKill();
  }

  trackBossKill(boss, player) {
    let multiplier = 1;
    
    // No damage bonus
    if (player.hp >= 100) {
      this.addScore('noHitBonus', 1, true);
      multiplier *= 2;
    }
    
    // Speed bonus (under 2 minutes)
    const fightDuration = (performance.now() - this.sessionStartTime) / 1000;
    if (fightDuration < 120) {
      this.addScore('speedBonus', 1, true);
      multiplier *= 1.5;
    }
    
    this.addScore('bossKill', multiplier);
    this.game.achievements?.trackBossDefeat();
  }

  update(deltaTime) {
    // Update multiplier
    if (this.multiplierTimer > 0) {
      this.multiplierTimer -= deltaTime;
      if (this.multiplierTimer <= 0) {
        this.scoreMultiplier = Math.max(1.0, this.scoreMultiplier - 0.5);
      }
    }
    
    // Update kill streak
    if (this.killStreakTimer > 0) {
      this.killStreakTimer -= deltaTime;
      if (this.killStreakTimer <= 0) {
        this.killStreak = 0;
      }
    }
    
    // Add survival time score
    const survivalScore = deltaTime * this.scoreValues.timeSurvived;
    this.currentScore += survivalScore;
  }

  showScorePopup(score, type) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = `+${score}`;
    
    // Position based on player location
    const player = this.game.players[0];
    popup.style.left = (player.pos.x - 30) + 'px';
    popup.style.top = (player.pos.y - 50) + 'px';
    
    // Color based on score type
    if (type.includes('Kill')) {
      popup.style.color = '#f44336';
    } else if (type.includes('Bonus')) {
      popup.style.color = '#4caf50';
    } else {
      popup.style.color = '#ffeb3b';
    }
    
    document.body.appendChild(popup);
    
    // Animate and remove
    setTimeout(() => popup.classList.add('show'), 50);
    setTimeout(() => {
      popup.classList.add('fade');
      setTimeout(() => document.body.removeChild(popup), 500);
    }, 1500);
  }

  recordScoreEvent(type, score) {
    this.scoringHistory.push({
      type,
      score,
      time: performance.now() - this.sessionStartTime,
      multiplier: this.scoreMultiplier
    });
  }

  getSessionStats() {
    return {
      score: Math.floor(this.currentScore),
      killStreak: this.killStreak,
      maxKillStreak: Math.max(...this.scoringHistory.map(e => e.killStreak || 0), this.killStreak),
      survivalTime: (performance.now() - this.sessionStartTime) / 1000,
      scoreMultiplier: this.scoreMultiplier,
      events: this.scoringHistory.length
    };
  }

  reset() {
    this.currentScore = 0;
    this.scoreMultiplier = 1.0;
    this.multiplierTimer = 0;
    this.killStreak = 0;
    this.killStreakTimer = 0;
    this.recentKills = [];
    this.scoringHistory = [];
    this.sessionStartTime = performance.now();
  }

  renderScoreUI(ctx) {
    ctx.save();
    
    // Score display
    const x = this.game.W - 250;
    const y = 20;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, 220, 80);
    
    ctx.strokeStyle = this.scoreMultiplier > 1 ? '#ffeb3b' : '#64b5f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 220, 80);
    
    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`Score: ${Math.floor(this.currentScore).toLocaleString()}`, x + 8, y + 25);
    
    // Multiplier
    if (this.scoreMultiplier > 1) {
      ctx.fillStyle = '#ffeb3b';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`x${this.scoreMultiplier.toFixed(1)} Multiplier`, x + 8, y + 45);
      
      // Multiplier timer bar
      const progress = this.multiplierTimer / 5.0;
      ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
      ctx.fillRect(x + 8, y + 50, 200, 6);
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(x + 8, y + 50, 200 * progress, 6);
    }
    
    // Kill streak
    if (this.killStreak > 0) {
      ctx.fillStyle = this.killStreak >= 10 ? '#f44336' : '#ff9800';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`${this.killStreak} Kill Streak!`, x + 8, y + 70);
    }
    
    ctx.restore();
  }
}

export class LeaderboardSystem {
  constructor() {
    this.leaderboards = {
      highScore: [],
      longestSurvival: [],
      mostKills: [],
      fastestClear: []
    };
    
    this.loadLeaderboards();
  }

  submitScore(playerName, stats, gameMode = 'normal') {
    const entry = {
      name: playerName,
      score: stats.score,
      survivalTime: stats.survivalTime,
      kills: stats.totalKills || 0,
      clearTime: stats.clearTime || null,
      date: new Date().toISOString(),
      gameMode
    };
    
    // Add to appropriate leaderboards
    this.addToLeaderboard('highScore', entry, (a, b) => b.score - a.score);
    this.addToLeaderboard('longestSurvival', entry, (a, b) => b.survivalTime - a.survivalTime);
    this.addToLeaderboard('mostKills', entry, (a, b) => b.kills - a.kills);
    
    if (entry.clearTime) {
      this.addToLeaderboard('fastestClear', entry, (a, b) => a.clearTime - b.clearTime);
    }
    
    this.saveLeaderboards();
    return this.getPlayerRanking(entry);
  }

  addToLeaderboard(type, entry, sortFn) {
    const board = this.leaderboards[type];
    board.push(entry);
    board.sort(sortFn);
    
    // Keep top 20
    if (board.length > 20) {
      board.splice(20);
    }
  }

  getPlayerRanking(entry) {
    const rankings = {};
    
    for (const [type, board] of Object.entries(this.leaderboards)) {
      const index = board.findIndex(e => 
        e.name === entry.name && 
        e.date === entry.date
      );
      if (index !== -1) {
        rankings[type] = index + 1;
      }
    }
    
    return rankings;
  }

  getLeaderboard(type, limit = 10) {
    return this.leaderboards[type]?.slice(0, limit) || [];
  }

  renderLeaderboard(ctx, type, x, y, width, height) {
    const board = this.getLeaderboard(type, 10);
    if (board.length === 0) return;
    
    ctx.save();
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x, y, width, height);
    
    ctx.strokeStyle = '#64b5f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(this.getLeaderboardTitle(type), x + 10, y + 25);
    
    // Entries
    ctx.font = '12px sans-serif';
    for (let i = 0; i < Math.min(board.length, 8); i++) {
      const entry = board[i];
      const entryY = y + 50 + i * 25;
      
      // Rank
      ctx.fillStyle = i < 3 ? '#ffeb3b' : '#cccccc';
      ctx.fillText(`${i + 1}.`, x + 10, entryY);
      
      // Name
      ctx.fillStyle = '#ffffff';
      ctx.fillText(entry.name.substring(0, 12), x + 35, entryY);
      
      // Value
      ctx.fillStyle = '#64b5f6';
      const value = this.formatLeaderboardValue(type, entry);
      ctx.fillText(value, x + width - 80, entryY);
    }
    
    ctx.restore();
  }

  getLeaderboardTitle(type) {
    const titles = {
      highScore: 'High Scores',
      longestSurvival: 'Longest Survival',
      mostKills: 'Most Kills',
      fastestClear: 'Fastest Clear'
    };
    return titles[type] || type;
  }

  formatLeaderboardValue(type, entry) {
    switch (type) {
      case 'highScore':
        return entry.score.toLocaleString();
      case 'longestSurvival':
        return this.formatTime(entry.survivalTime);
      case 'mostKills':
        return entry.kills.toString();
      case 'fastestClear':
        return entry.clearTime ? this.formatTime(entry.clearTime) : 'N/A';
      default:
        return '';
    }
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  saveLeaderboards() {
    try {
      localStorage.setItem('fracture_realms_leaderboards', JSON.stringify(this.leaderboards));
    } catch (e) {
      console.warn('Could not save leaderboards:', e);
    }
  }

  loadLeaderboards() {
    try {
      const saved = localStorage.getItem('fracture_realms_leaderboards');
      if (saved) {
        const data = JSON.parse(saved);
        this.leaderboards = { ...this.leaderboards, ...data };
      }
    } catch (e) {
      console.warn('Could not load leaderboards:', e);
    }
  }

  clearLeaderboards() {
    this.leaderboards = {
      highScore: [],
      longestSurvival: [],
      mostKills: [],
      fastestClear: []
    };
    this.saveLeaderboards();
  }
}

// CSS for score popups (to be added to styles.css)
export const scoringStyles = `
.score-popup {
  position: fixed;
  font-weight: bold;
  font-size: 16px;
  z-index: 999;
  pointer-events: none;
  opacity: 0;
  transform: translateY(0px);
  transition: all 0.5s ease-out;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.score-popup.show {
  opacity: 1;
  transform: translateY(-40px);
}

.score-popup.fade {
  opacity: 0;
  transform: translateY(-80px);
}
`;
