// Mini-Games System for Fracture Realms
// Bonus content and variety through engaging mini-games

export class MiniGameSystem {
  constructor(game) {
    this.game = game;
    this.activeMiniGame = null;
    this.miniGameScore = 0;
    this.miniGameHighScores = new Map();
    
    this.initializeMiniGames();
  }

  initializeMiniGames() {
    this.miniGames = {
      shard_collector: {
        id: 'shard_collector',
        name: 'Shard Collector',
        description: 'Collect as many shards as possible in 30 seconds',
        icon: '💎',
        difficulty: 'easy',
        rewards: { shards: 10, experience: 50 }
      },
      
      gravity_master: {
        id: 'gravity_master',
        name: 'Gravity Master',
        description: 'Navigate through gravity-flipping challenges',
        icon: '🌀',
        difficulty: 'medium',
        rewards: { shards: 25, experience: 100 }
      },
      
      time_trial: {
        id: 'time_trial',
        name: 'Time Trial',
        description: 'Complete the course as fast as possible',
        icon: '⏱️',
        difficulty: 'hard',
        rewards: { shards: 50, experience: 200 }
      },
      
      boss_rush: {
        id: 'boss_rush',
        name: 'Boss Rush',
        description: 'Defeat all bosses in sequence',
        icon: '👹',
        difficulty: 'extreme',
        rewards: { shards: 100, experience: 500 }
      },
      
      memory_game: {
        id: 'memory_game',
        name: 'Realm Memory',
        description: 'Remember the sequence of realm appearances',
        icon: '🧠',
        difficulty: 'medium',
        rewards: { shards: 30, experience: 150 }
      },
      
      rhythm_game: {
        id: 'rhythm_game',
        name: 'Rhythm of the Realms',
        description: 'Hit the beats in time with the music',
        icon: '🎵',
        difficulty: 'medium',
        rewards: { shards: 40, experience: 180 }
      }
    };
  }

  startMiniGame(miniGameId) {
    const miniGame = this.miniGames[miniGameId];
    if (!miniGame) return false;
    
    this.activeMiniGame = miniGame;
    this.miniGameScore = 0;
    
    this.game.log(`Starting mini-game: ${miniGame.name}`, 'ok');
    
    // Hide main game UI
    this.game.paused = true;
    
    // Start the specific mini-game
    switch (miniGameId) {
      case 'shard_collector':
        this.startShardCollector();
        break;
      case 'gravity_master':
        this.startGravityMaster();
        break;
      case 'time_trial':
        this.startTimeTrial();
        break;
      case 'boss_rush':
        this.startBossRush();
        break;
      case 'memory_game':
        this.startMemoryGame();
        break;
      case 'rhythm_game':
        this.startRhythmGame();
        break;
    }
    
    return true;
  }

  startShardCollector() {
    const overlay = document.createElement('div');
    overlay.className = 'minigame-overlay';
    overlay.innerHTML = `
      <div class="minigame-container">
        <div class="minigame-header">
          <h2>💎 Shard Collector</h2>
          <div class="minigame-timer">Time: <span id="timer">30</span>s</div>
          <div class="minigame-score">Score: <span id="score">0</span></div>
        </div>
        <canvas id="shardGame" width="800" height="600"></canvas>
        <div class="minigame-controls">
          <button class="btn" id="endGame">End Game</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    const canvas = document.getElementById('shardGame');
    const ctx = canvas.getContext('2d');
    
    let timeLeft = 30;
    let shards = [];
    let player = { x: 400, y: 300, size: 20 };
    
    // Create shards
    const createShard = () => {
      shards.push({
        x: Math.random() * 760 + 20,
        y: Math.random() * 560 + 20,
        size: 10 + Math.random() * 10,
        value: Math.floor(Math.random() * 5) + 1,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      });
    };
    
    // Game loop
    const gameLoop = () => {
      if (timeLeft <= 0) {
        this.endMiniGame();
        return;
      }
      
      // Update
      timeLeft -= 1/60;
      
      // Create new shards
      if (Math.random() < 0.3) {
        createShard();
      }
      
      // Move player
      const keys = this.game.input.keys;
      if (keys['a'] || keys['arrowleft']) player.x -= 5;
      if (keys['d'] || keys['arrowright']) player.x += 5;
      if (keys['w'] || keys['arrowup']) player.y -= 5;
      if (keys['s'] || keys['arrowdown']) player.y += 5;
      
      // Keep player in bounds
      player.x = Math.max(20, Math.min(780, player.x));
      player.y = Math.max(20, Math.min(580, player.y));
      
      // Check collisions
      for (let i = shards.length - 1; i >= 0; i--) {
        const shard = shards[i];
        const dist = Math.hypot(player.x - shard.x, player.y - shard.y);
        
        if (dist < player.size + shard.size) {
          this.miniGameScore += shard.value;
          shards.splice(i, 1);
        }
      }
      
      // Render
      ctx.clearRect(0, 0, 800, 600);
      
      // Draw shards
      shards.forEach(shard => {
        ctx.fillStyle = shard.color;
        ctx.beginPath();
        ctx.arc(shard.x, shard.y, shard.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw player
      ctx.fillStyle = '#64b5f6';
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Update UI
      document.getElementById('timer').textContent = Math.ceil(timeLeft);
      document.getElementById('score').textContent = this.miniGameScore;
      
      requestAnimationFrame(gameLoop);
    };
    
    gameLoop();
    
    // End game button
    document.getElementById('endGame').addEventListener('click', () => {
      this.endMiniGame();
    });
  }

  startGravityMaster() {
    const overlay = document.createElement('div');
    overlay.className = 'minigame-overlay';
    overlay.innerHTML = `
      <div class="minigame-container">
        <div class="minigame-header">
          <h2>🌀 Gravity Master</h2>
          <div class="minigame-instructions">
            Navigate through the course! Press SPACE to flip gravity.
          </div>
          <div class="minigame-score">Score: <span id="score">0</span></div>
        </div>
        <canvas id="gravityGame" width="800" height="600"></canvas>
        <div class="minigame-controls">
          <button class="btn" id="endGame">End Game</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    const canvas = document.getElementById('gravityGame');
    const ctx = canvas.getContext('2d');
    
    let player = { x: 50, y: 300, vx: 0, vy: 0, gravity: 1 };
    let platforms = [];
    let obstacles = [];
    let checkpoints = [];
    let currentCheckpoint = 0;
    
    // Create course
    for (let i = 0; i < 20; i++) {
      platforms.push({
        x: i * 100,
        y: Math.random() * 400 + 100,
        width: 80,
        height: 20
      });
    }
    
    // Game loop
    const gameLoop = () => {
      // Update
      player.vy += 0.5 * player.gravity;
      player.x += player.vx;
      player.y += player.vy;
      
      // Gravity flip
      if (this.game.input.keys[' ']) {
        player.gravity *= -1;
        player.vy *= -0.5;
      }
      
      // Movement
      if (this.game.input.keys['a'] || this.game.input.keys['arrowleft']) {
        player.vx -= 0.5;
      }
      if (this.game.input.keys['d'] || this.game.input.keys['arrowright']) {
        player.vx += 0.5;
      }
      
      // Friction
      player.vx *= 0.9;
      
      // Collision with platforms
      platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + 20 > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + 20 > platform.y) {
          
          if (player.vy * player.gravity > 0) {
            player.y = platform.y - 20;
            player.vy = 0;
          }
        }
      });
      
      // Render
      ctx.clearRect(0, 0, 800, 600);
      
      // Draw platforms
      ctx.fillStyle = '#4caf50';
      platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      });
      
      // Draw player
      ctx.fillStyle = '#64b5f6';
      ctx.fillRect(player.x, player.y, 20, 20);
      
      // Draw gravity indicator
      ctx.fillStyle = '#ff9800';
      ctx.font = '20px sans-serif';
      ctx.fillText(player.gravity > 0 ? '↓' : '↑', player.x - 10, player.y - 10);
      
      requestAnimationFrame(gameLoop);
    };
    
    gameLoop();
    
    document.getElementById('endGame').addEventListener('click', () => {
      this.endMiniGame();
    });
  }

  startTimeTrial() {
    const overlay = document.createElement('div');
    overlay.className = 'minigame-overlay';
    overlay.innerHTML = `
      <div class="minigame-container">
        <div class="minigame-header">
          <h2>⏱️ Time Trial</h2>
          <div class="minigame-timer">Time: <span id="timer">0.00</span>s</div>
          <div class="minigame-best">Best: <span id="best">--</span>s</div>
        </div>
        <canvas id="timeTrialGame" width="800" height="600"></canvas>
        <div class="minigame-controls">
          <button class="btn" id="endGame">End Game</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    const canvas = document.getElementById('timeTrialGame');
    const ctx = canvas.getContext('2d');
    
    let startTime = performance.now();
    let finished = false;
    let bestTime = this.miniGameHighScores.get('time_trial') || Infinity;
    
    // Create race course
    let checkpoints = [
      { x: 100, y: 100, reached: false },
      { x: 300, y: 200, reached: false },
      { x: 500, y: 150, reached: false },
      { x: 700, y: 300, reached: false },
      { x: 600, y: 500, reached: false },
      { x: 400, y: 450, reached: false },
      { x: 200, y: 400, reached: false },
      { x: 50, y: 550, reached: false }
    ];
    
    let player = { x: 50, y: 550, size: 15 };
    let currentCheckpoint = 0;
    
    // Game loop
    const gameLoop = () => {
      if (finished) return;
      
      const currentTime = (performance.now() - startTime) / 1000;
      
      // Update player
      if (this.game.input.keys['a'] || this.game.input.keys['arrowleft']) player.x -= 3;
      if (this.game.input.keys['d'] || this.game.input.keys['arrowright']) player.x += 3;
      if (this.game.input.keys['w'] || this.game.input.keys['arrowup']) player.y -= 3;
      if (this.game.input.keys['s'] || this.game.input.keys['arrowdown']) player.y += 3;
      
      // Check checkpoint collisions
      if (currentCheckpoint < checkpoints.length) {
        const checkpoint = checkpoints[currentCheckpoint];
        const dist = Math.hypot(player.x - checkpoint.x, player.y - checkpoint.y);
        
        if (dist < 30) {
          checkpoint.reached = true;
          currentCheckpoint++;
          
          if (currentCheckpoint >= checkpoints.length) {
            finished = true;
            this.miniGameScore = currentTime;
            
            if (currentTime < bestTime) {
              bestTime = currentTime;
              this.miniGameHighScores.set('time_trial', bestTime);
              this.game.log('New best time!', 'ok');
            }
          }
        }
      }
      
      // Render
      ctx.clearRect(0, 0, 800, 600);
      
      // Draw checkpoints
      checkpoints.forEach((checkpoint, index) => {
        ctx.fillStyle = checkpoint.reached ? '#4caf50' : 
                       index === currentCheckpoint ? '#ff9800' : '#cccccc';
        ctx.beginPath();
        ctx.arc(checkpoint.x, checkpoint.y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.fillText(index + 1, checkpoint.x - 5, checkpoint.y + 4);
      });
      
      // Draw player
      ctx.fillStyle = '#64b5f6';
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Update UI
      document.getElementById('timer').textContent = currentTime.toFixed(2);
      document.getElementById('best').textContent = bestTime === Infinity ? '--' : bestTime.toFixed(2);
      
      if (finished) {
        ctx.fillStyle = '#4caf50';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('FINISHED!', 350, 300);
      }
      
      requestAnimationFrame(gameLoop);
    };
    
    gameLoop();
    
    document.getElementById('endGame').addEventListener('click', () => {
      this.endMiniGame();
    });
  }

  startMemoryGame() {
    const overlay = document.createElement('div');
    overlay.className = 'minigame-overlay';
    overlay.innerHTML = `
      <div class="minigame-container">
        <div class="minigame-header">
          <h2>🧠 Realm Memory</h2>
          <div class="minigame-instructions">Remember the sequence!</div>
          <div class="minigame-score">Level: <span id="level">1</span></div>
        </div>
        <div class="memory-game">
          <div class="memory-grid">
            <div class="memory-card" data-realm="genesis">Genesis</div>
            <div class="memory-card" data-realm="shards">Shards</div>
            <div class="memory-card" data-realm="chrono">Chrono</div>
            <div class="memory-card" data-realm="ember">Ember</div>
            <div class="memory-card" data-realm="dusk">Dusk</div>
            <div class="memory-card" data-realm="rift">Rift</div>
            <div class="memory-card" data-realm="glacier">Glacier</div>
            <div class="memory-card" data-realm="zenith">Zenith</div>
          </div>
        </div>
        <div class="minigame-controls">
          <button class="btn" id="endGame">End Game</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    let sequence = [];
    let playerSequence = [];
    let level = 1;
    let showingSequence = false;
    
    const startLevel = () => {
      sequence = [];
      playerSequence = [];
      
      // Add random realm to sequence
      const realms = ['genesis', 'shards', 'chrono', 'ember', 'dusk', 'rift', 'glacier', 'zenith'];
      for (let i = 0; i < level; i++) {
        sequence.push(realms[Math.floor(Math.random() * realms.length)]);
      }
      
      showSequence();
    };
    
    const showSequence = () => {
      showingSequence = true;
      let index = 0;
      
      const showNext = () => {
        if (index < sequence.length) {
          const card = document.querySelector(`[data-realm="${sequence[index]}"]`);
          card.classList.add('active');
          
          setTimeout(() => {
            card.classList.remove('active');
            index++;
            setTimeout(showNext, 500);
          }, 1000);
        } else {
          showingSequence = false;
        }
      };
      
      showNext();
    };
    
    // Card click handler
    document.querySelectorAll('.memory-card').forEach(card => {
      card.addEventListener('click', () => {
        if (showingSequence) return;
        
        const realm = card.dataset.realm;
        playerSequence.push(realm);
        
        card.classList.add('selected');
        setTimeout(() => card.classList.remove('selected'), 300);
        
        // Check if sequence is correct so far
        const currentIndex = playerSequence.length - 1;
        if (playerSequence[currentIndex] !== sequence[currentIndex]) {
          // Wrong sequence
          this.miniGameScore = level - 1;
          this.endMiniGame();
          return;
        }
        
        // Check if sequence is complete
        if (playerSequence.length === sequence.length) {
          level++;
          document.getElementById('level').textContent = level;
          setTimeout(startLevel, 1000);
        }
      });
    });
    
    startLevel();
    
    document.getElementById('endGame').addEventListener('click', () => {
      this.endMiniGame();
    });
  }

  startRhythmGame() {
    const overlay = document.createElement('div');
    overlay.className = 'minigame-overlay';
    overlay.innerHTML = `
      <div class="minigame-container">
        <div class="minigame-header">
          <h2>🎵 Rhythm of the Realms</h2>
          <div class="minigame-instructions">Hit the beats in time!</div>
          <div class="minigame-score">Score: <span id="score">0</span></div>
        </div>
        <div class="rhythm-game">
          <div class="rhythm-track">
            <div class="rhythm-line"></div>
            <div class="rhythm-hits"></div>
          </div>
        </div>
        <div class="minigame-controls">
          <button class="btn" id="endGame">End Game</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    let score = 0;
    let hits = [];
    let hitIndex = 0;
    
    // Create rhythm pattern
    const createHit = () => {
      hits.push({
        x: Math.random() * 400 + 200,
        y: 0,
        speed: 2,
        active: true
      });
    };
    
    // Game loop
    const gameLoop = () => {
      // Create new hits
      if (Math.random() < 0.1) {
        createHit();
      }
      
      // Update hits
      hits.forEach(hit => {
        hit.y += hit.speed;
        
        // Check if hit reached bottom
        if (hit.y > 400) {
          hit.active = false;
        }
      });
      
      // Remove inactive hits
      hits = hits.filter(hit => hit.active);
      
      // Check for key presses
      if (this.game.input.keys[' '] || this.game.input.keys['enter']) {
        // Find closest hit
        let closestHit = null;
        let closestDist = Infinity;
        
        hits.forEach(hit => {
          const dist = Math.abs(hit.y - 350);
          if (dist < closestDist && dist < 50) {
            closestHit = hit;
            closestDist = dist;
          }
        });
        
        if (closestHit) {
          score += Math.max(1, 10 - Math.floor(closestDist / 5));
          closestHit.active = false;
          this.game.audio.hit();
        }
      }
      
      // Render
      const track = document.querySelector('.rhythm-track');
      track.innerHTML = '<div class="rhythm-line"></div>';
      
      hits.forEach(hit => {
        const hitElement = document.createElement('div');
        hitElement.className = 'rhythm-hit';
        hitElement.style.left = hit.x + 'px';
        hitElement.style.top = hit.y + 'px';
        track.appendChild(hitElement);
      });
      
      document.getElementById('score').textContent = score;
      
      requestAnimationFrame(gameLoop);
    };
    
    gameLoop();
    
    document.getElementById('endGame').addEventListener('click', () => {
      this.endMiniGame();
    });
  }

  endMiniGame() {
    if (!this.activeMiniGame) return;
    
    // Calculate rewards
    const rewards = this.activeMiniGame.rewards;
    const shardReward = Math.floor(rewards.shards * (this.miniGameScore / 100));
    const expReward = Math.floor(rewards.experience * (this.miniGameScore / 100));
    
    // Apply rewards
    this.game.shardCount += shardReward;
    this.game.campaign?.addShards?.(shardReward);
    
    // Show results
    this.showMiniGameResults(shardReward, expReward);
    
    // Clean up
    this.activeMiniGame = null;
    this.game.paused = false;
    
    // Remove overlay
    const overlay = document.querySelector('.minigame-overlay');
    if (overlay) {
      document.body.removeChild(overlay);
    }
  }

  showMiniGameResults(shardReward, expReward) {
    const results = document.createElement('div');
    results.className = 'minigame-results';
    results.innerHTML = `
      <div class="results-content">
        <h2>Mini-Game Complete!</h2>
        <div class="results-score">Final Score: ${this.miniGameScore}</div>
        <div class="results-rewards">
          <div>Shards: +${shardReward}</div>
          <div>Experience: +${expReward}</div>
        </div>
        <button class="btn primary" onclick="this.parentElement.parentElement.remove()">Continue</button>
      </div>
    `;
    
    document.body.appendChild(results);
    
    setTimeout(() => {
      if (document.body.contains(results)) {
        document.body.removeChild(results);
      }
    }, 5000);
  }

  renderMiniGameUI(ctx) {
    if (!this.activeMiniGame) return;
    
    ctx.save();
    
    // Mini-game status
    const x = 20;
    const y = 20;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x, y, 300, 60);
    
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 300, 60);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(this.activeMiniGame.name, x + 8, y + 20);
    
    ctx.fillStyle = '#cccccc';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Score: ${this.miniGameScore}`, x + 8, y + 40);
    
    ctx.restore();
  }
}

// CSS for mini-games (to be added to styles.css)
export const miniGameStyles = `
.minigame-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.minigame-container {
  background: linear-gradient(135deg, #1a237e, #3949ab);
  border: 2px solid #7986cb;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  max-width: 90vw;
  max-height: 90vh;
}

.minigame-header {
  text-align: center;
  margin-bottom: 20px;
}

.minigame-header h2 {
  color: #ffffff;
  margin-bottom: 8px;
}

.minigame-timer, .minigame-score {
  color: #64b5f6;
  font-weight: bold;
  margin: 4px 0;
}

.minigame-instructions {
  color: #c5cae9;
  font-size: 14px;
  margin: 8px 0;
}

.minigame-controls {
  text-align: center;
  margin-top: 20px;
}

.memory-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 20px 0;
}

.memory-card {
  background: #2b3b58;
  border: 2px solid #3a4b68;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  color: #ffffff;
  font-weight: bold;
}

.memory-card:hover {
  border-color: #64b5f6;
  background: #3a4b68;
}

.memory-card.active {
  background: #64b5f6;
  border-color: #42a5f5;
  transform: scale(1.1);
}

.memory-card.selected {
  background: #4caf50;
  border-color: #66bb6a;
}

.rhythm-game {
  width: 100%;
  height: 400px;
  position: relative;
}

.rhythm-track {
  width: 100%;
  height: 100%;
  position: relative;
  background: #1a237e;
  border-radius: 8px;
  overflow: hidden;
}

.rhythm-line {
  position: absolute;
  bottom: 50px;
  left: 0;
  right: 0;
  height: 4px;
  background: #64b5f6;
}

.rhythm-hit {
  position: absolute;
  width: 20px;
  height: 20px;
  background: #ff9800;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.minigame-results {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.results-content {
  background: linear-gradient(135deg, #2e7d32, #4caf50);
  border: 2px solid #66bb6a;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.results-content h2 {
  color: #ffffff;
  margin-bottom: 16px;
}

.results-score {
  font-size: 18px;
  font-weight: bold;
  color: #c8e6c9;
  margin-bottom: 12px;
}

.results-rewards {
  color: #ffffff;
  margin-bottom: 20px;
}

.results-rewards div {
  margin: 4px 0;
}
`;
