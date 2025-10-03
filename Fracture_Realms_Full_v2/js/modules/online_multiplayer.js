// Online Multiplayer System for Fracture Realms
// Real-time multiplayer with WebRTC and Socket.IO

export class OnlineMultiplayerSystem {
  constructor(game) {
    this.game = game;
    this.socket = null;
    this.roomId = null;
    this.playerId = null;
    this.players = new Map();
    this.isHost = false;
    this.isConnected = false;
    this.connectionState = 'disconnected';
    
    // Prefer same-origin server if available, fall back to dedicated server
    const sameOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const dedicated = 'https://fracture-realms-server.onrender.com';
    this.serverCandidates = [sameOrigin, dedicated].filter(Boolean);
    this.serverUrl = this.serverCandidates[0];
    this.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ];
    
    this.peerConnections = new Map();
    this.dataChannels = new Map();
    
    this.setupEventHandlers();
  }

  async connect(roomId = null) {
    try {
      this.connectionState = 'connecting';
      
      // Try candidates until one connects
      await this.tryConnectCandidates();
      
      // Generate player ID
      this.playerId = this.generatePlayerId();
      
      // Setup socket event handlers
      this.setupSocketHandlers();
      
      // Join or create room
      if (roomId) {
        this.roomId = roomId;
        this.socket.emit('join-room', { roomId, playerId: this.playerId });
      } else {
        this.socket.emit('create-room', { playerId: this.playerId });
      }
      
    } catch (error) {
      console.error('Failed to connect to multiplayer server:', error);
      this.connectionState = 'error';
    }
  }

  async tryConnectCandidates() {
    let lastError = null;
    for (const url of this.serverCandidates) {
      try {
        await new Promise((resolve, reject) => {
          const socket = io(url, { transports: ['websocket', 'polling'], path: '/socket.io' });
          let settled = false;
          const onConnect = () => { if (!settled) { settled = true; cleanup(); this.socket = socket; resolve(); } };
          const onError = (err) => { if (!settled) { settled = true; cleanup(); socket.close(); reject(err||new Error('connect_error')); } };
          const cleanup = () => {
            socket.off('connect', onConnect);
            socket.off('connect_error', onError);
            socket.off('error', onError);
          };
          socket.on('connect', onConnect);
          socket.on('connect_error', onError);
          socket.on('error', onError);
          // Failsafe timeout
          setTimeout(() => onError(new Error('connect_timeout')), 6000);
        });
        this.serverUrl = url;
        console.log('Connected to multiplayer server:', url);
        return;
      } catch (e) {
        lastError = e;
        console.warn('Multiplayer connect failed for', url, e?.message||e);
      }
    }
    throw lastError || new Error('All multiplayer servers unreachable');
  }

  // Optional UI bindings; safe no-op if elements are missing
  setupEventHandlers() {
    try {
      const createBtn = document.getElementById('btnCreateRoom');
      const joinBtn = document.getElementById('btnJoinRoom');
      if (createBtn) {
        // Avoid multiple listeners
        const clone = createBtn.cloneNode(true);
        createBtn.parentNode.replaceChild(clone, createBtn);
        clone.addEventListener('click', (e) => {
          e.preventDefault();
          if (this.connectionState === 'connecting') return;
          this.connect(null);
        });
      }
      if (joinBtn) {
        const clone = joinBtn.cloneNode(true);
        joinBtn.parentNode.replaceChild(clone, joinBtn);
        clone.addEventListener('click', (e) => {
          e.preventDefault();
          if (this.connectionState === 'connecting') return;
          const code = prompt('Enter Room Code');
          if (!code) return;
          this.connect(code.trim());
        });
      }
    } catch {}
  }

  setupSocketHandlers() {
    this.socket.on('connect', () => {
      console.log('Connected to multiplayer server');
      this.isConnected = true;
      this.connectionState = 'connected';
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from multiplayer server');
      this.isConnected = false;
      this.connectionState = 'disconnected';
    });

    this.socket.on('room-created', (data) => {
      this.roomId = data.roomId;
      this.isHost = true;
      console.log('Room created:', this.roomId);
      this.showRoomCode(this.roomId);
    });

    this.socket.on('room-joined', (data) => {
      this.roomId = data.roomId;
      this.isHost = false;
      console.log('Joined room:', this.roomId);
      this.hideRoomCode();
    });

    this.socket.on('player-joined', async (data) => {
      console.log('Player joined:', data.playerId);
      await this.setupPeerConnection(data.playerId, true);
    });

    this.socket.on('player-left', (data) => {
      console.log('Player left:', data.playerId);
      this.removePlayer(data.playerId);
    });

    this.socket.on('offer', async (data) => {
      await this.handleOffer(data);
    });

    this.socket.on('answer', async (data) => {
      await this.handleAnswer(data);
    });

    this.socket.on('ice-candidate', async (data) => {
      await this.handleIceCandidate(data);
    });

    this.socket.on('game-state', (data) => {
      this.handleGameState(data);
    });

    this.socket.on('player-input', (data) => {
      this.handlePlayerInput(data);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.connectionState = 'error';
    });
  }

  async setupPeerConnection(playerId, isInitiator) {
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: this.iceServers
      });

      this.peerConnections.set(playerId, peerConnection);

      // Setup data channel for game data
      if (isInitiator) {
        const dataChannel = peerConnection.createDataChannel('gameData', {
          ordered: true
        });
        this.setupDataChannel(dataChannel, playerId);
        this.dataChannels.set(playerId, dataChannel);
      }

      // Handle incoming data channel
      peerConnection.ondatachannel = (event) => {
        const dataChannel = event.channel;
        this.setupDataChannel(dataChannel, playerId);
        this.dataChannels.set(playerId, dataChannel);
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit('ice-candidate', {
            roomId: this.roomId,
            targetPlayerId: playerId,
            candidate: event.candidate
          });
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(`Connection state with ${playerId}:`, peerConnection.connectionState);
      };

      // Create offer if initiator
      if (isInitiator) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        this.socket.emit('offer', {
          roomId: this.roomId,
          targetPlayerId: playerId,
          offer: offer
        });
      }

    } catch (error) {
      console.error('Failed to setup peer connection:', error);
    }
  }

  setupDataChannel(dataChannel, playerId) {
    dataChannel.onopen = () => {
      console.log(`Data channel opened with ${playerId}`);
    };

    dataChannel.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handlePeerMessage(data, playerId);
    };

    dataChannel.onclose = () => {
      console.log(`Data channel closed with ${playerId}`);
    };

    dataChannel.onerror = (error) => {
      console.error(`Data channel error with ${playerId}:`, error);
    };
  }

  async handleOffer(data) {
    try {
      const peerConnection = this.peerConnections.get(data.playerId);
      if (!peerConnection) {
        await this.setupPeerConnection(data.playerId, false);
        const newPeerConnection = this.peerConnections.get(data.playerId);
        await newPeerConnection.setRemoteDescription(data.offer);
        
        const answer = await newPeerConnection.createAnswer();
        await newPeerConnection.setLocalDescription(answer);
        
        this.socket.emit('answer', {
          roomId: this.roomId,
          targetPlayerId: data.playerId,
          answer: answer
        });
      }
    } catch (error) {
      console.error('Failed to handle offer:', error);
    }
  }

  async handleAnswer(data) {
    try {
      const peerConnection = this.peerConnections.get(data.playerId);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(data.answer);
      }
    } catch (error) {
      console.error('Failed to handle answer:', error);
    }
  }

  async handleIceCandidate(data) {
    try {
      const peerConnection = this.peerConnections.get(data.playerId);
      if (peerConnection) {
        await peerConnection.addIceCandidate(data.candidate);
      }
    } catch (error) {
      console.error('Failed to handle ICE candidate:', error);
    }
  }

  handlePeerMessage(data, playerId) {
    switch (data.type) {
      case 'player-state':
        this.updatePlayerState(playerId, data.state);
        break;
      case 'game-event':
        this.handleGameEvent(data.event, playerId);
        break;
      case 'chat-message':
        this.handleChatMessage(data.message, playerId);
        break;
    }
  }

  updatePlayerState(playerId, state) {
    if (!this.players.has(playerId)) {
      this.players.set(playerId, new OnlinePlayer(playerId));
    }
    
    const player = this.players.get(playerId);
    player.updateState(state);
  }

  handleGameEvent(event, playerId) {
    switch (event.type) {
      case 'player-attack':
        this.handlePlayerAttack(event, playerId);
        break;
      case 'player-damage':
        this.handlePlayerDamage(event, playerId);
        break;
      case 'item-collected':
        this.handleItemCollected(event, playerId);
        break;
      case 'boss-defeated':
        this.handleBossDefeated(event, playerId);
        break;
    }
  }

  handlePlayerAttack(event, playerId) {
    // Create attack effect for remote player
    const player = this.players.get(playerId);
    if (player) {
      this.game.weaponSystem?.createAttack({
        x: event.x,
        y: event.y,
        damage: event.damage,
        range: event.range,
        type: event.weaponType,
        owner: player
      });
    }
  }

  handlePlayerDamage(event, playerId) {
    const player = this.players.get(playerId);
    if (player) {
      player.takeDamage(event.damage);
    }
  }

  handleItemCollected(event, playerId) {
    // Handle item collection for remote player
    const player = this.players.get(playerId);
    if (player) {
      player.collectItem(event.item);
    }
  }

  handleBossDefeated(event, playerId) {
    // Handle boss defeat
    this.game.boss?.defeat();
  }

  handleChatMessage(message, playerId) {
    // Display chat message
    this.game.ui?.showChatMessage?.(message, playerId);
  }

  sendPlayerState() {
    if (!this.isConnected) return;
    
    const playerState = {
      type: 'player-state',
      state: {
        x: this.game.players[0].pos.x,
        y: this.game.players[0].pos.y,
        vx: this.game.players[0].vel.x,
        vy: this.game.players[0].vel.y,
        hp: this.game.players[0].hp,
        maxHp: this.game.players[0].maxHp,
        combo: this.game.players[0].combo,
        facing: this.game.players[0].facing,
        state: this.game.players[0].state,
        timestamp: Date.now()
      }
    };
    
    this.broadcastToPeers(playerState);
  }

  sendGameEvent(event) {
    if (!this.isConnected) return;
    
    const gameEvent = {
      type: 'game-event',
      event: {
        ...event,
        playerId: this.playerId,
        timestamp: Date.now()
      }
    };
    
    this.broadcastToPeers(gameEvent);
  }

  sendChatMessage(message) {
    if (!this.isConnected) return;
    
    const chatMessage = {
      type: 'chat-message',
      message: {
        text: message,
        playerId: this.playerId,
        timestamp: Date.now()
      }
    };
    
    this.broadcastToPeers(chatMessage);
  }

  broadcastToPeers(data) {
    for (const [playerId, dataChannel] of this.dataChannels) {
      if (dataChannel.readyState === 'open') {
        dataChannel.send(JSON.stringify(data));
      }
    }
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
    
    const peerConnection = this.peerConnections.get(playerId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(playerId);
    }
    
    const dataChannel = this.dataChannels.get(playerId);
    if (dataChannel) {
      this.dataChannels.delete(playerId);
    }
  }

  showRoomCode(roomId) {
    // Show room code to host
    const container = document.getElementById('roomCode');
    const valueEl = document.getElementById('roomCodeValue');
    if (valueEl) valueEl.textContent = roomId;
    if (container) {
      container.classList.remove('hidden');
      container.style.display = 'block';
    }
    const copyBtn = document.getElementById('btnCopyRoomCode');
    if (copyBtn) {
      copyBtn.onclick = async () => {
        try { await navigator.clipboard.writeText(roomId); } catch {}
      };
    }
  }

  hideRoomCode() {
    const container = document.getElementById('roomCode');
    if (container) {
      container.style.display = 'none';
      container.classList.add('hidden');
    }
  }

  generatePlayerId() {
    return 'player_' + Math.random().toString(36).substr(2, 9);
  }

  update(dt) {
    // Send player state updates
    if (this.isConnected && this.game.players[0]) {
      this.sendPlayerState();
    }
    
    // Update online players
    for (const player of this.players.values()) {
      player.update(dt);
    }
  }

  render(ctx) {
    // Render online players
    for (const player of this.players.values()) {
      player.render(ctx);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    // Close all peer connections
    for (const peerConnection of this.peerConnections.values()) {
      peerConnection.close();
    }
    
    this.peerConnections.clear();
    this.dataChannels.clear();
    this.players.clear();
    
    this.isConnected = false;
    this.connectionState = 'disconnected';
  }
}

class OnlinePlayer {
  constructor(playerId) {
    this.playerId = playerId;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.hp = 100;
    this.maxHp = 100;
    this.combo = 0;
    this.facing = 1;
    this.state = 'idle';
    this.timestamp = 0;
    
    this.interpolationBuffer = [];
    this.lastUpdateTime = 0;
  }

  updateState(state) {
    // Add to interpolation buffer
    this.interpolationBuffer.push({
      ...state,
      timestamp: Date.now()
    });
    
    // Keep only recent updates
    const now = Date.now();
    this.interpolationBuffer = this.interpolationBuffer.filter(
      update => now - update.timestamp < 1000
    );
  }

  update(dt) {
    // Interpolate position based on recent updates
    if (this.interpolationBuffer.length > 0) {
      const now = Date.now();
      const targetUpdate = this.interpolationBuffer[this.interpolationBuffer.length - 1];
      
      // Simple interpolation
      const lerpFactor = Math.min(1, dt * 10);
      this.x = this.lerp(this.x, targetUpdate.x, lerpFactor);
      this.y = this.lerp(this.y, targetUpdate.y, lerpFactor);
      this.vx = this.lerp(this.vx, targetUpdate.vx, lerpFactor);
      this.vy = this.lerp(this.vy, targetUpdate.vy, lerpFactor);
      
      // Update other properties
      this.hp = targetUpdate.hp;
      this.maxHp = targetUpdate.maxHp;
      this.combo = targetUpdate.combo;
      this.facing = targetUpdate.facing;
      this.state = targetUpdate.state;
    }
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  takeDamage(damage) {
    this.hp = Math.max(0, this.hp - damage);
  }

  collectItem(item) {
    // Handle item collection
    console.log(`Player ${this.playerId} collected ${item}`);
  }

  render(ctx) {
    // Render online player
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Draw player representation
    ctx.fillStyle = '#00FF00'; // Green for online players
    ctx.fillRect(-20, -30, 40, 60);
    
    // Draw name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.playerId, 0, -40);
    
    // Draw health bar
    const barWidth = 40;
    const barHeight = 4;
    const barY = -35;
    
    ctx.fillStyle = '#333333';
    ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);
    
    const healthPercent = this.hp / this.maxHp;
    ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFFF00' : '#FF0000';
    ctx.fillRect(-barWidth / 2, barY, barWidth * healthPercent, barHeight);
    
    ctx.restore();
  }
}

// Leaderboard System
export class OnlineLeaderboardSystem {
  constructor(game) {
    this.game = game;
    this.leaderboards = new Map();
    this.playerRankings = new Map();
    this.isConnected = false;
    
    this.serverUrl = 'https://fracture-realms-server.onrender.com';
    this.socket = null;
  }

  async connect() {
    try {
      this.socket = io(this.serverUrl);
      
      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('Connected to leaderboard server');
      });
      
      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('Disconnected from leaderboard server');
      });
      
      this.socket.on('leaderboard-update', (data) => {
        this.updateLeaderboard(data.leaderboardType, data.rankings);
      });
      
      this.socket.on('player-ranking', (data) => {
        this.updatePlayerRanking(data.leaderboardType, data.ranking);
      });
      
    } catch (error) {
      console.error('Failed to connect to leaderboard server:', error);
    }
  }

  async submitScore(leaderboardType, score, metadata = {}) {
    if (!this.isConnected) return;
    
    const scoreData = {
      playerId: this.game.playerId || 'anonymous',
      playerName: this.game.playerName || 'Anonymous',
      score: score,
      metadata: metadata,
      timestamp: Date.now()
    };
    
    this.socket.emit('submit-score', {
      leaderboardType: leaderboardType,
      scoreData: scoreData
    });
  }

  async getLeaderboard(leaderboardType, limit = 10) {
    if (!this.isConnected) return null;
    
    this.socket.emit('get-leaderboard', {
      leaderboardType: leaderboardType,
      limit: limit
    });
  }

  updateLeaderboard(leaderboardType, rankings) {
    this.leaderboards.set(leaderboardType, rankings);
    this.displayLeaderboard(leaderboardType);
  }

  updatePlayerRanking(leaderboardType, ranking) {
    this.playerRankings.set(leaderboardType, ranking);
  }

  displayLeaderboard(leaderboardType) {
    const rankings = this.leaderboards.get(leaderboardType);
    if (!rankings) return;
    
    // Update UI with leaderboard data
    const leaderboardElement = document.getElementById('leaderboard');
    if (leaderboardElement) {
      leaderboardElement.innerHTML = '';
      
      rankings.forEach((entry, index) => {
        const entryElement = document.createElement('div');
        entryElement.className = 'leaderboard-entry';
        entryElement.innerHTML = `
          <span class="rank">${index + 1}</span>
          <span class="player-name">${entry.playerName}</span>
          <span class="score">${entry.score}</span>
        `;
        leaderboardElement.appendChild(entryElement);
      });
    }
  }

  getPlayerRanking(leaderboardType) {
    return this.playerRankings.get(leaderboardType);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.isConnected = false;
  }
}

// Export for use in main game
export { OnlinePlayer };
