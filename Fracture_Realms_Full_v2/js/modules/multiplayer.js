// Enhanced Multiplayer System for Fracture Realms
// Local co-op and online multiplayer support

export class MultiplayerSystem {
  constructor(game) {
    this.game = game;
    this.mode = 'single'; // 'single', 'local', 'online'
    this.players = [];
    this.maxPlayers = 4;
    this.teamMode = false;
    this.friendlyFire = false;
    this.respawnTimer = 3.0;
    this.respawnInvincibility = 2.0;
    
    this.initializeMultiplayer();
  }

  initializeMultiplayer() {
    // Enable second player by default
    this.enablePlayer(1, true);
    
    // Set up multiplayer controls
    this.setupMultiplayerControls();
    
    // Initialize team colors
    this.teamColors = [
      '#90caf9', // Blue
      '#a5d6a7', // Green  
      '#ffcdd2', // Red
      '#fff9c4'  // Yellow
    ];
  }

  setupMultiplayerControls() {
    // Enhanced input for multiple players
    this.game.input.p2 = () => {
      const k = this.game.input.keys;
      return {
        ax: (k['arrowleft'] ? -1 : 0) + (k['arrowright'] ? 1 : 0),
        jump: k['arrowup'],
        melee: k['/'],
        magic: k['.'],
        dash: k['0'],
        grapple: k['control'],
        style1: k['7'],
        style2: k['8'],
        style3: k['9']
      };
    };
  }

  enablePlayer(playerId, enabled) {
    if (playerId >= 1 && playerId < this.game.players.length) {
      this.game.players[playerId].enabled = enabled;
      this.game.players[playerId].alive = enabled;
      
      if (enabled) {
        this.game.players[playerId].hp = 100;
        this.game.players[playerId].pos = {
          x: this.game.W * 0.5 + (playerId - 1) * 60,
          y: this.game.H * 0.2
        };
        this.game.players[playerId].vel = { x: 0, y: 0 };
        this.game.players[playerId].tint = this.teamColors[playerId - 1];
      }
    }
  }

  setMode(mode) {
    this.mode = mode;
    
    switch (mode) {
      case 'single':
        this.enablePlayer(1, false);
        break;
      case 'local':
        this.enablePlayer(1, true);
        break;
      case 'online':
        // Future online implementation
        break;
    }
  }

  update(deltaTime) {
    if (this.mode === 'single') return;
    
    // Update all enabled players
    for (let i = 0; i < this.game.players.length; i++) {
      const player = this.game.players[i];
      if (!player.enabled) continue;
      
      // Handle respawning
      if (!player.alive && player.respawnTimer > 0) {
        player.respawnTimer -= deltaTime;
        if (player.respawnTimer <= 0) {
          this.respawnPlayer(player);
        }
      }
      
      // Update invincibility
      if (player.respawnInvincibility > 0) {
        player.respawnInvincibility -= deltaTime;
        player.invincible = player.respawnInvincibility > 0;
      }
    }
    
    // Check for team-based objectives
    if (this.teamMode) {
      this.updateTeamObjectives();
    }
  }

  respawnPlayer(player) {
    player.alive = true;
    player.hp = 100;
    player.respawnTimer = 0;
    player.respawnInvincibility = this.respawnInvincibility;
    player.invincible = true;
    
    // Respawn at safe location
    player.pos = {
      x: this.game.W * 0.5 + (Math.random() - 0.5) * 100,
      y: this.game.H * 0.2
    };
    player.vel = { x: 0, y: 0 };
    
    // Visual effect
    this.game.particleSystem?.createExplosion(player.pos.x, player.pos.y, {
      color: player.tint,
      count: 30
    });
    
    this.game.log(`Player ${player.id} respawned!`, 'ok');
  }

  updateTeamObjectives() {
    // Team-based scoring and objectives
    const team1Players = this.game.players.filter(p => p.id % 2 === 1 && p.enabled);
    const team2Players = this.game.players.filter(p => p.id % 2 === 0 && p.enabled);
    
    // Check team survival
    const team1Alive = team1Players.some(p => p.alive);
    const team2Alive = team2Players.some(p => p.alive);
    
    if (!team1Alive || !team2Alive) {
      const winningTeam = team1Alive ? 1 : 2;
      this.game.log(`Team ${winningTeam} wins!`, 'ok');
    }
  }

  handlePlayerDeath(player) {
    if (this.mode === 'single') return;
    
    player.alive = false;
    player.respawnTimer = this.respawnTimer;
    
    // Death effects
    this.game.particleSystem?.createExplosion(player.pos.x, player.pos.y, {
      color: player.tint,
      count: 25
    });
    
    this.game.log(`Player ${player.id} eliminated!`, 'danger');
    
    // Check for game over
    const alivePlayers = this.game.players.filter(p => p.enabled && p.alive);
    if (alivePlayers.length <= 1) {
      this.handleGameOver();
    }
  }

  handleGameOver() {
    const alivePlayers = this.game.players.filter(p => p.enabled && p.alive);
    
    if (alivePlayers.length === 1) {
      const winner = alivePlayers[0];
      this.game.log(`Player ${winner.id} wins!`, 'ok');
      
      // Victory effects
      this.game.particleSystem?.createExplosion(winner.pos.x, winner.pos.y, {
        color: '#ffd700',
        count: 50
      });
    } else {
      this.game.log('Draw!', 'warn');
    }
    
    // Show multiplayer results
    setTimeout(() => {
      this.showMultiplayerResults();
    }, 2000);
  }

  showMultiplayerResults() {
    const results = document.createElement('div');
    results.className = 'overlay';
    results.innerHTML = `
      <div class="panel">
        <h2>Multiplayer Results</h2>
        <div class="results-content">
          ${this.game.players.filter(p => p.enabled).map(player => `
            <div class="player-result">
              <div class="player-color" style="background: ${player.tint}"></div>
              <div class="player-info">
                <div class="player-name">Player ${player.id}</div>
                <div class="player-stats">
                  Kills: ${player.kills || 0} | 
                  Deaths: ${player.deaths || 0} | 
                  Score: ${player.score || 0}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="results-actions">
          <button class="btn primary" onclick="this.parentElement.parentElement.parentElement.remove()">Continue</button>
          <button class="btn" onclick="window.location.reload()">Restart</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(results);
  }

  renderMultiplayerUI(ctx) {
    if (this.mode === 'single') return;
    
    ctx.save();
    
    // Player status indicators
    for (let i = 0; i < this.game.players.length; i++) {
      const player = this.game.players[i];
      if (!player.enabled) continue;
      
      const x = 20;
      const y = 20 + i * 80;
      
      // Player background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x, y, 200, 60);
      
      // Player color indicator
      ctx.fillStyle = player.tint;
      ctx.fillRect(x, y, 8, 60);
      
      // Player info
      ctx.fillStyle = player.alive ? '#ffffff' : '#666666';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`Player ${player.id}`, x + 15, y + 20);
      
      // Health bar
      if (player.alive) {
        const healthPercent = Math.max(0, player.hp) / 100;
        const healthColor = healthPercent > 0.5 ? '#4caf50' : healthPercent > 0.25 ? '#ff9800' : '#f44336';
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(x + 15, y + 30, 150, 8);
        
        ctx.fillStyle = healthColor;
        ctx.fillRect(x + 15, y + 30, 150 * healthPercent, 8);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.fillText(`${Math.max(0, player.hp|0)} HP`, x + 15, y + 45);
      } else {
        // Respawn timer
        const timeLeft = Math.ceil(player.respawnTimer);
        ctx.fillStyle = '#ff9800';
        ctx.font = '12px sans-serif';
        ctx.fillText(`Respawning in ${timeLeft}s`, x + 15, y + 40);
      }
      
      // Team indicator
      if (this.teamMode) {
        const team = (player.id - 1) % 2 + 1;
        ctx.fillStyle = '#64b5f6';
        ctx.font = '10px sans-serif';
        ctx.fillText(`Team ${team}`, x + 15, y + 55);
      }
    }
    
    ctx.restore();
  }

  // Multiplayer-specific game modes
  setTeamMode(enabled) {
    this.teamMode = enabled;
    this.friendlyFire = !enabled;
    
    if (enabled) {
      // Assign teams
      for (let i = 0; i < this.game.players.length; i++) {
        const player = this.game.players[i];
        if (player.enabled) {
          player.team = (i % 2) + 1;
        }
      }
    }
  }

  // Power-up sharing system
  sharePowerUp(player, powerUp) {
    if (!this.teamMode) return;
    
    const teammates = this.game.players.filter(p => 
      p.enabled && p.alive && p.team === player.team && p.id !== player.id
    );
    
    teammates.forEach(teammate => {
      this.game.powerUpSystem?.applyPowerUp(teammate.id, powerUp);
    });
  }

  // Cooperative abilities
  enableCooperativeAbilities() {
    // Players can combine attacks
    this.game.comboAttacks = true;
    
    // Shared health pool
    this.game.sharedHealth = true;
    
    // Synchronized abilities
    this.game.synchronizedAbilities = true;
  }
}

// CSS for multiplayer UI (to be added to styles.css)
export const multiplayerStyles = `
.results-content {
  display: grid;
  gap: 12px;
  margin: 16px 0;
}

.player-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(16, 28, 49, 0.6);
  border-radius: 8px;
  border: 1px solid #253553;
}

.player-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
}

.player-info {
  flex: 1;
}

.player-name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
}

.player-stats {
  font-size: 12px;
  color: var(--muted);
}

.results-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 20px;
}
`;
