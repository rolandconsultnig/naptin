# Owl Talk Mediasoup Server

SFU (Selective Forwarding Unit) server for secure WebRTC communication with:

✅ **SRTP/DTLS Encryption** - WebRTC transport encryption
✅ **Client-to-Client Encryption** - Additional payload encryption layer
✅ **Multi-Participant Support** - Scales to large groups
✅ **Firewall/NAT Traversal** - Works behind firewalls

## Security Features

### 1. Transport Encryption (SRTP/DTLS)
- Automatic encryption of all WebRTC traffic
- DTLS for signaling channel encryption
- Industry-standard WebRTC security

### 2. Client-to-Client Encryption
- Additional AES-256-GCM encryption layer
- Server cannot decrypt payloads
- True end-to-end encryption for sensitive data

## Installation

```bash
cd mediasoup-server
npm install
```

## Running the Server

```bash
npm start
# or for development
npm run dev
```

The server will start on port 4000 (or MEDIASOUP_PORT env variable).

## Integration

The server exposes a Socket.IO interface for:
- Creating WebRTC transports
- Producing/consuming media streams
- Sending encrypted messages
- Room management

## Endpoints

- `GET /health` - Server health check
- Socket.IO: `/socket.io` - WebSocket connection

## Port Configuration

- Default: 4000
- Environment: Set `MEDIASOUP_PORT` to change
