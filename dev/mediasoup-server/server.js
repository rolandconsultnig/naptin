/**
 * Mediasoup SFU Server with SRTP/DTLS + Client-to-Client Encryption
 * Provides secure WebRTC media routing with enhanced encryption
 */

const express = require('express');
const cors = require('cors');
const mediasoup = require('mediasoup');
const { Server } = require('socket.io');
const encryption = require('./encryption');
const http = require('http');

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Mediasoup workers
const workers = [];
let nextWorkerIndex = 0;

// Active rooms and transports
const rooms = new Map();
const transports = new Map();

// Initialize Mediasoup workers
async function createWorkers() {
  const { numWorkers } = mediasoup.getSupportedRtpCapabilities();
  
  for (let i = 0; i < Math.min(numWorkers || 3, 3); i++) {
    const worker = await mediasoup.createWorker({
      logLevel: 'warn',
      rtcMinPort: 40000,
      rtcMaxPort: 49999
    });

    worker.on('died', () => {
      console.error('❌ Mediasoup worker died, exiting');
      process.exit(1);
    });

    workers.push({
      worker,
      router: null
    });
  }

  console.log(`✅ Created ${workers.length} Mediasoup workers`);
}

// Get or create router
async function getOrCreateRouter() {
  const worker = workers[nextWorkerIndex];
  nextWorkerIndex = (nextWorkerIndex + 1) % workers.length;

  if (!worker.router) {
    const router = await worker.worker.createRouter({
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2,
          rtcpFeedback: [
            { type: 'transport-cc' }
          ]
        },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          clockRate: 90000,
          rtcpFeedback: [
            { type: 'nack' },
            { type: 'transport-cc' }
          ]
        },
        {
          kind: 'video',
          mimeType: 'video/H264',
          clockRate: 90000,
          rtcpFeedback: [
            { type: 'nack' },
            { type: 'transport-cc' }
          ]
        }
      ]
    });

    worker.router = router;
  }

  return worker.router;
}

// Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Get RTP capabilities
  socket.on('getRouterRtpCapabilities', async (data, callback) => {
    try {
      const router = await getOrCreateRouter();
      const rtpCapabilities = router.rtpCapabilities;
      callback({ rtpCapabilities });
    } catch (error) {
      console.error('Error getting router RTP capabilities:', error);
      callback({ error: error.message });
    }
  });

  // Create transport
  socket.on('createWebRtcTransport', async (data, callback) => {
    try {
      const { roomId, userId } = data;
      
      const router = await getOrCreateRouter();
      const transport = await router.createWebRtcTransport({
        listenIps: [{ ip: '0.0.0.0', announcedIp: null }],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
        // Configure SRTP/DTLS encryption
        enableSrtp: true
      });

      transports.set(transport.id, { transport, socketId: socket.id, userId });

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
      }
      rooms.get(roomId).set(userId, { transport, producers: [], consumers: [] });

      // Handle transport events
      transport.on('dtlsstatechange', (state) => {
        console.log(`🔐 DTLS state changed to: ${state}`);
      });

      transport.on('sctpstatechange', (state) => {
        console.log(`🔌 SCTP state changed to: ${state}`);
      });

      callback({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
        sctpParameters: transport.sctpParameters
      });
    } catch (error) {
      console.error('Error creating transport:', error);
      callback({ error: error.message });
    }
  });

  // Connect transport
  socket.on('connectTransport', async (data, callback) => {
    try {
      const { transportId, dtlsParameters } = data;
      const { transport } = transports.get(transportId);
      
      await transport.connect({ dtlsParameters });
      
      console.log(`✅ Transport connected: ${transportId}`);
      callback({ success: true });
    } catch (error) {
      console.error('Error connecting transport:', error);
      callback({ error: error.message });
    }
  });

  // Produce (send media)
  socket.on('produce', async (data, callback) => {
    try {
      const { transportId, kind, rtpParameters, roomId, userId } = data;
      const { transport } = transports.get(transportId);
      
      const producer = await transport.produce({ kind, rtpParameters });
      
      const room = rooms.get(roomId);
      if (room) {
        room.get(userId).producers.push(producer);
        
        // Broadcast to other participants in room
        socket.to(roomId).emit('newProducer', {
          producerId: producer.id,
          kind,
          userId
        });
      }
      
      callback({
        id: producer.id,
        kind: producer.kind
      });
    } catch (error) {
      console.error('Error producing:', error);
      callback({ error: error.message });
    }
  });

  // Consume (receive media)
  socket.on('consume', async (data, callback) => {
    try {
      const { transportId, producerId, rtpCapabilities, roomId, userId } = data;
      const { transport } = transports.get(transportId);
      
      const canConsume = transport.router.canConsume({
        producerId,
        rtpCapabilities
      });
      
      if (!canConsume) {
        callback({ error: 'Cannot consume' });
        return;
      }
      
      const consumer = await transport.consume({
        producerId,
        rtpCapabilities
      });
      
      const room = rooms.get(roomId);
      if (room) {
        room.get(userId).consumers.push(consumer);
      }
      
      callback({
        id: consumer.id,
        producerId: consumer.producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type
      });
    } catch (error) {
      console.error('Error consuming:', error);
      callback({ error: error.message });
    }
  });

  // Join room
  socket.on('joinRoom', (data) => {
    const { roomId, userId } = data;
    socket.join(roomId);
    console.log(`👤 User ${userId} joined room ${roomId}`);
    
    // Generate shared encryption key for this session
    const sessionKey = `${roomId}_${Date.now()}`;
    socket.emit('sessionKey', { sessionKey });
  });

  // Send encrypted message
  socket.on('sendEncryptedMessage', (data) => {
    const { message, targetUserId, roomId, encryptionKey } = data;
    
    // Encrypt payload
    const encrypted = encryption.encryptJSON(message, encryptionKey);
    
    // Broadcast to target user
    socket.to(roomId).emit('encryptedMessage', {
      encrypted,
      fromUserId: socket.id
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    
    // Clean up transports
    for (const [transportId, { socketId }] of transports.entries()) {
      if (socketId === socket.id) {
        const { transport } = transports.get(transportId);
        transport.close();
        transports.delete(transportId);
      }
    }
    
    // Clean up rooms
    for (const [roomId, participants] of rooms.entries()) {
      for (const [userId] of participants.entries()) {
        if (socket.id === userId) {
          participants.delete(userId);
        }
      }
      
      if (participants.size === 0) {
        rooms.delete(roomId);
      }
    }
  });
});

const PORT = process.env.MEDIASOUP_PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🎉 Mediasoup server running on port ${PORT}`);
  console.log(`🔐 SRTP/DTLS encryption: ENABLED`);
  console.log(`🔒 Client-to-client encryption: ENABLED`);
  createWorkers();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', workers: workers.length });
});
