# Fracture Realms Deployment Guide for Render

This guide will help you deploy Fracture Realms with MongoDB on Render.

## 🚀 Quick Setup

### 1. Deploy MongoDB Database

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure MongoDB**:
   - **Name**: `fracture-realms-db`
   - **Environment**: `Docker`
   - **Dockerfile**: Use the MongoDB Dockerfile below
   - **Plan**: Free tier (or paid for production)

### 2. Create MongoDB Dockerfile

Create a file called `Dockerfile.mongodb` in your project root:

```dockerfile
FROM mongo:5.0

# Create data directory
RUN mkdir -p /data/db

# Expose MongoDB port
EXPOSE 27017

# Start MongoDB
CMD ["mongod", "--bind_ip_all"]
```

### 3. Deploy Web Service

1. **Create another Web Service** for your game server
2. **Configure**:
   - **Name**: `fracture-realms-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free tier (or paid for production)

### 4. Environment Variables

In your Render dashboard, add these environment variables:

```bash
# MongoDB Connection
MONGODB_URI=mongodb://fracture-realms-db:27017/fracture-realms

# Server Configuration
PORT=3000
NODE_ENV=production

# CORS Settings
CORS_ORIGIN=https://fracture-realms.onrender.com
```

## 🔧 Alternative: MongoDB Atlas (Recommended)

For better performance and reliability, use MongoDB Atlas:

### 1. Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/atlas
2. Sign up for a free account
3. Create a new cluster (free tier available)

### 2. Configure Database

1. **Create Database**: `fracture-realms`
2. **Create Collections**:
   - `players`
   - `scores`
   - `rooms`
3. **Set up User**:
   - Username: `fracture-realms-user`
   - Password: Generate a strong password
   - Database User Privileges: `Read and write to any database`

### 3. Get Connection String

1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string
4. Replace `<password>` with your user password
5. Replace `<dbname>` with `fracture-realms`

Example connection string:
```
mongodb+srv://fracture-realms-user:yourpassword@cluster0.xxxxx.mongodb.net/fracture-realms?retryWrites=true&w=majority
```

### 4. Update Environment Variables

In Render dashboard, update:
```bash
MONGODB_URI=mongodb+srv://fracture-realms-user:yourpassword@cluster0.xxxxx.mongodb.net/fracture-realms?retryWrites=true&w=majority
```

## 📁 Project Structure

Your project should have this structure:
```
Fracture_Realms_Full_v2/
├── server.js                 # Main server file
├── package.json              # Dependencies
├── js/
│   ├── game.js              # Main game logic
│   └── modules/             # Game modules
│       ├── adaptive_difficulty.js
│       ├── mobs.js
│       ├── stages.js
│       └── online_multiplayer.js
├── index.html               # Game client
├── styles.css               # Game styles
└── DEPLOYMENT_GUIDE.md      # This file
```

## 🛠️ Local Development Setup

### 1. Install Dependencies

```bash
cd Fracture_Realms_Full_v2
npm install
```

### 2. Set Environment Variables

Create a `.env` file:
```bash
MONGODB_URI=mongodb://localhost:27017/fracture-realms
PORT=3000
NODE_ENV=development
```

### 3. Start Development Server

```bash
npm run dev
```

## 🚀 Production Deployment

### 1. Update Client Configuration

In your `js/modules/online_multiplayer.js`, update the server URL:

```javascript
// Change this line:
this.serverUrl = 'https://fracture-realms-server.onrender.com';

// Or use environment variable:
this.serverUrl = process.env.SERVER_URL || 'https://fracture-realms-server.onrender.com';
```

### 2. Deploy to Render

1. **Push your code** to GitHub
2. **Connect repository** to Render
3. **Deploy automatically** on every push

### 3. Update Game Client

Update your game's server URL in the client code:

```javascript
// In js/modules/online_multiplayer.js
this.serverUrl = 'https://your-render-app.onrender.com';
```

## 🔍 Testing Your Deployment

### 1. Test Database Connection

Visit: `https://your-app.onrender.com/health`

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "activeRooms": 0,
  "activePlayers": 0
}
```

### 2. Test API Endpoints

- **Leaderboards**: `https://your-app.onrender.com/api/leaderboards/overall`
- **Player Stats**: `https://your-app.onrender.com/api/player/test-player/stats`
- **Global Stats**: `https://your-app.onrender.com/api/adaptive-difficulty/global-stats`

### 3. Test Multiplayer

1. Open your game in two browser tabs
2. Create a room in one tab
3. Join the room in the other tab
4. Test real-time synchronization

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check your connection string
   - Ensure MongoDB service is running
   - Verify network access in MongoDB Atlas

2. **CORS Errors**
   - Update CORS_ORIGIN environment variable
   - Check your domain in the CORS settings

3. **WebSocket Connection Failed**
   - Ensure Socket.IO is properly configured
   - Check firewall settings
   - Verify the server URL in client code

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=true
NODE_ENV=development
```

## 📊 Monitoring

### 1. Render Dashboard

Monitor your services in the Render dashboard:
- **Logs**: View real-time logs
- **Metrics**: CPU, memory, and network usage
- **Deployments**: Track deployment history

### 2. MongoDB Atlas

Monitor your database:
- **Metrics**: Connection count, operations
- **Logs**: Database access logs
- **Alerts**: Set up alerts for issues

## 🔒 Security Considerations

### 1. Environment Variables

- Never commit sensitive data to Git
- Use Render's environment variable system
- Rotate passwords regularly

### 2. Database Security

- Use strong passwords
- Enable IP whitelisting in MongoDB Atlas
- Use SSL/TLS connections

### 3. API Security

- Implement rate limiting
- Validate all inputs
- Use HTTPS in production

## 📈 Scaling

### 1. Database Scaling

- Upgrade MongoDB Atlas plan
- Use read replicas for better performance
- Implement database sharding for large datasets

### 2. Server Scaling

- Upgrade Render plan for more resources
- Use multiple server instances
- Implement load balancing

## 🎯 Performance Optimization

### 1. Database Optimization

- Create proper indexes
- Use connection pooling
- Implement caching

### 2. Server Optimization

- Enable gzip compression
- Use CDN for static assets
- Implement Redis for session storage

## 📞 Support

If you encounter issues:

1. **Check Render logs** for server errors
2. **Check MongoDB Atlas logs** for database issues
3. **Test locally** to isolate problems
4. **Check network connectivity** between services

## 🎉 Success!

Once deployed, your Fracture Realms game will have:

- ✅ **Online multiplayer** with real-time synchronization
- ✅ **Adaptive difficulty** that adjusts to player skill
- ✅ **Leaderboards** with persistent data
- ✅ **100+ unique enemies** with advanced AI
- ✅ **15+ unique stages** with distinct mechanics
- ✅ **Professional-grade architecture** ready for scaling

Your game is now a complete online multiplayer experience! 🚀
