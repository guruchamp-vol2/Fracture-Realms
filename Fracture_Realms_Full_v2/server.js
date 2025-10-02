// Fracture Realms Online Multiplayer Server
// Handles real-time multiplayer, leaderboards, and game state synchronization

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fracture-realms', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Database schemas
const playerSchema = new mongoose.Schema({
  playerId: String,
  playerName: String,
  totalScore: Number,
  gamesPlayed: Number,
  wins: Number,
  losses: Number,
  achievements: [String],
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

const scoreSchema = new mongoose.Schema({
  playerId: String,
  playerName: String,
  score: Number,
  leaderboardType: String,
  metadata: Object,
  timestamp: { type: Date, default: Date.now }
});

const roomSchema = new mongoose.Schema({
  roomId: String,
  hostId: String,
  players: [String],
  gameState: Object,
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const Player = mongoose.model('Player', playerSchema);
const Score = mongoose.model('Score', scoreSchema);
const Room = mongoose.model('Room', roomSchema);

// In-memory storage for active rooms and players
const activeRooms = new Map();
const activePlayers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  
  // Player joins the server
  socket.on('join-server', async (data) => {
    try {
      const { playerId, playerName } = data;
      
      // Store player info
      activePlayers.set(socket.id, {
        playerId,
        playerName,
        socketId: socket.id,
        roomId: null,
        isHost: false
      });
      
      // Update or create player in database
      await Player.findOneAndUpdate(
        { playerId },
        {
          playerName,
          lastActive: new Date()
        },
        { upsert: true, new: true }
      );
      
      socket.emit('server-joined', { success: true });
    } catch (error) {
      console.error('Error joining server:', error);
      socket.emit('error', { message: 'Failed to join server' });
    }
  });
  
  // Create a new room
  socket.on('create-room', async (data) => {
    try {
      const { playerId } = data;
      const roomId = generateRoomId();
      
      // Create room in database
      const room = new Room({
        roomId,
        hostId: playerId,
        players: [playerId],
        gameState: {}
      });
      await room.save();
      
      // Store in memory
      activeRooms.set(roomId, {
        roomId,
        hostId: playerId,
        players: [playerId],
        gameState: {},
        sockets: [socket.id]
      });
      
      // Update player info
      const player = activePlayers.get(socket.id);
      if (player) {
        player.roomId = roomId;
        player.isHost = true;
      }
      
      socket.join(roomId);
      socket.emit('room-created', { roomId });
      
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', { message: 'Failed to create room' });
    }
  });
  
  // Join an existing room
  socket.on('join-room', async (data) => {
    try {
      const { roomId, playerId } = data;
      
      // Check if room exists
      const room = activeRooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      // Check if room is full (max 4 players)
      if (room.players.length >= 4) {
        socket.emit('error', { message: 'Room is full' });
        return;
      }
      
      // Add player to room
      room.players.push(playerId);
      room.sockets.push(socket.id);
      
      // Update player info
      const player = activePlayers.get(socket.id);
      if (player) {
        player.roomId = roomId;
        player.isHost = false;
      }
      
      socket.join(roomId);
      
      // Notify all players in room
      io.to(roomId).emit('player-joined', { playerId });
      
      // Send current game state to new player
      socket.emit('room-joined', { roomId, gameState: room.gameState });
      
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });
  
  // Handle WebRTC signaling
  socket.on('offer', (data) => {
    const { roomId, targetPlayerId, offer } = data;
    socket.to(roomId).emit('offer', {
      playerId: activePlayers.get(socket.id)?.playerId,
      targetPlayerId,
      offer
    });
  });
  
  socket.on('answer', (data) => {
    const { roomId, targetPlayerId, answer } = data;
    socket.to(roomId).emit('answer', {
      playerId: activePlayers.get(socket.id)?.playerId,
      targetPlayerId,
      answer
    });
  });
  
  socket.on('ice-candidate', (data) => {
    const { roomId, targetPlayerId, candidate } = data;
    socket.to(roomId).emit('ice-candidate', {
      playerId: activePlayers.get(socket.id)?.playerId,
      targetPlayerId,
      candidate
    });
  });
  
  // Handle game state updates
  socket.on('game-state-update', (data) => {
    const player = activePlayers.get(socket.id);
    if (!player || !player.roomId) return;
    
    const room = activeRooms.get(player.roomId);
    if (!room) return;
    
    // Update room game state
    room.gameState[player.playerId] = data;
    
    // Broadcast to other players in room
    socket.to(player.roomId).emit('game-state', {
      playerId: player.playerId,
      state: data
    });
  });
  
  // Handle player input
  socket.on('player-input', (data) => {
    const player = activePlayers.get(socket.id);
    if (!player || !player.roomId) return;
    
    // Broadcast input to other players
    socket.to(player.roomId).emit('player-input', {
      playerId: player.playerId,
      input: data
    });
  });
  
  // Handle score submission
  socket.on('submit-score', async (data) => {
    try {
      const { leaderboardType, scoreData } = data;
      
      // Save score to database
      const score = new Score({
        playerId: scoreData.playerId,
        playerName: scoreData.playerName,
        score: scoreData.score,
        leaderboardType,
        metadata: scoreData.metadata
      });
      await score.save();
      
      // Update player stats
      await Player.findOneAndUpdate(
        { playerId: scoreData.playerId },
        {
          $inc: { 
            totalScore: scoreData.score,
            gamesPlayed: 1
          },
          lastActive: new Date()
        }
      );
      
      // Get updated leaderboard
      const leaderboard = await getLeaderboard(leaderboardType, 10);
      socket.emit('leaderboard-update', {
        leaderboardType,
        rankings: leaderboard
      });
      
      // Get player's ranking
      const playerRanking = await getPlayerRanking(scoreData.playerId, leaderboardType);
      socket.emit('player-ranking', {
        leaderboardType,
        ranking: playerRanking
      });
      
    } catch (error) {
      console.error('Error submitting score:', error);
      socket.emit('error', { message: 'Failed to submit score' });
    }
  });
  
  // Handle leaderboard requests
  socket.on('get-leaderboard', async (data) => {
    try {
      const { leaderboardType, limit } = data;
      const leaderboard = await getLeaderboard(leaderboardType, limit);
      
      socket.emit('leaderboard-update', {
        leaderboardType,
        rankings: leaderboard
      });
      
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      socket.emit('error', { message: 'Failed to get leaderboard' });
    }
  });
  
  // Handle player disconnect
  socket.on('disconnect', async () => {
    console.log('Player disconnected:', socket.id);
    
    const player = activePlayers.get(socket.id);
    if (player && player.roomId) {
      const room = activeRooms.get(player.roomId);
      if (room) {
        // Remove player from room
        room.players = room.players.filter(p => p !== player.playerId);
        room.sockets = room.sockets.filter(s => s !== socket.id);
        
        // Notify other players
        socket.to(player.roomId).emit('player-left', { playerId: player.playerId });
        
        // Clean up empty rooms
        if (room.players.length === 0) {
          activeRooms.delete(player.roomId);
          await Room.findOneAndDelete({ roomId: player.roomId });
        }
      }
    }
    
    activePlayers.delete(socket.id);
  });
});

// Helper functions
function generateRoomId() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

async function getLeaderboard(leaderboardType, limit = 10) {
  try {
    const scores = await Score.find({ leaderboardType })
      .sort({ score: -1 })
      .limit(limit)
      .exec();
    
    return scores.map((score, index) => ({
      rank: index + 1,
      playerId: score.playerId,
      playerName: score.playerName,
      score: score.score,
      timestamp: score.timestamp
    }));
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

async function getPlayerRanking(playerId, leaderboardType) {
  try {
    const playerScore = await Score.findOne({ playerId, leaderboardType });
    if (!playerScore) return null;
    
    const higherScores = await Score.countDocuments({
      leaderboardType,
      score: { $gt: playerScore.score }
    });
    
    return {
      rank: higherScores + 1,
      score: playerScore.score,
      totalPlayers: await Score.countDocuments({ leaderboardType })
    };
  } catch (error) {
    console.error('Error getting player ranking:', error);
    return null;
  }
}

// REST API endpoints
app.get('/api/leaderboards/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 10 } = req.query;
    
    const leaderboard = await getLeaderboard(type, parseInt(limit));
    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ success: false, error: 'Failed to get leaderboard' });
  }
});

app.get('/api/player/:playerId/stats', async (req, res) => {
  try {
    const { playerId } = req.params;
    
    const player = await Player.findOne({ playerId });
    if (!player) {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }
    
    res.json({ success: true, player });
  } catch (error) {
    console.error('Error getting player stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get player stats' });
  }
});

app.get('/api/rooms', (req, res) => {
  try {
    const rooms = Array.from(activeRooms.values()).map(room => ({
      roomId: room.roomId,
      playerCount: room.players.length,
      maxPlayers: 4,
      isActive: room.isActive
    }));
    
    res.json({ success: true, rooms });
  } catch (error) {
    console.error('Error getting rooms:', error);
    res.status(500).json({ success: false, error: 'Failed to get rooms' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    activeRooms: activeRooms.size,
    activePlayers: activePlayers.size
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Fracture Realms server running on port ${PORT}`);
});

module.exports = { app, server, io };
