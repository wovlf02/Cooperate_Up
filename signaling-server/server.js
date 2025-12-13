import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import cors from 'cors';
import { authenticateSocket } from './middleware/auth.js';
import { handleVideoEvents } from './handlers/video.js';
import { handleChatEvents } from './handlers/chat.js';
import { handlePresenceEvents } from './handlers/presence.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Express middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connections: io ? io.engine.clientsCount : 0,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  if (!io) {
    return res.json({ error: 'Socket.io not initialized' });
  }

  const rooms = Array.from(io.sockets.adapter.rooms.entries())
    .filter(([key]) => key.startsWith('video:') || key.startsWith('study:'))
    .map(([name, sockets]) => ({
      name,
      participants: sockets.size
    }));

  res.json({
    connections: io.engine.clientsCount,
    rooms: rooms.length,
    roomDetails: rooms,
    memory: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6 // 1MB
});

// Redis setup for multi-server support
let redisClient, redisSubClient;
const REDIS_URL = process.env.REDIS_URL;

async function initializeRedis() {
  if (REDIS_URL) {
    try {
      redisClient = createClient({ url: REDIS_URL });
      redisSubClient = redisClient.duplicate();

      redisClient.on('error', (err) => logger.error('Redis Pub Client Error:', err));
      redisSubClient.on('error', (err) => logger.error('Redis Sub Client Error:', err));

      await redisClient.connect();
      await redisSubClient.connect();

      io.adapter(createAdapter(redisClient, redisSubClient));
      logger.info('Redis adapter initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Redis:', error);
      logger.warn('Running without Redis adapter (single server mode)');
    }
  } else {
    logger.info('No REDIS_URL provided, running in single server mode');
  }
}

// Socket.io authentication middleware
io.use(authenticateSocket);

// Socket.io connection handler
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.user?.name || socket.userId} (${socket.id})`);

  // Register event handlers
  handleVideoEvents(socket, io);
  handleChatEvents(socket, io);
  handlePresenceEvents(socket, io);

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    logger.info(`User disconnected: ${socket.user?.name || socket.userId} (${socket.id}), reason: ${reason}`);
  });

  // Handle errors
  socket.on('error', (error) => {
    logger.error(`Socket error for ${socket.id}:`, error);
  });
});

// Start server
const PORT = process.env.PORT || 4000;

async function startServer() {
  await initializeRedis();

  httpServer.listen(PORT, () => {
    logger.info(`🚀 Signaling server listening on port ${PORT}`);
    logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Next.js URL: ${process.env.NEXTJS_URL}`);
    if (REDIS_URL) {
      logger.info(`📦 Redis: ${REDIS_URL}`);
    }
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(async () => {
    logger.info('HTTP server closed');
    if (redisClient) await redisClient.quit();
    if (redisSubClient) await redisSubClient.quit();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  httpServer.close(async () => {
    logger.info('HTTP server closed');
    if (redisClient) await redisClient.quit();
    if (redisSubClient) await redisSubClient.quit();
    process.exit(0);
  });
});

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export { io };

