# HTTPS & Network Access Guide - Works Like Teams/Zoom/Meet!

## 🎯 Overview

Owl-talk now supports HTTPS, allowing voice/video calls to work over network (LAN/WAN/Internet) just like Microsoft Teams, Google Meet, and Zoom!

### Why HTTPS?

Modern browsers require HTTPS for camera/microphone access on non-localhost domains. With HTTPS enabled:
- ✅ Voice calls work over network
- ✅ Video calls work over network  
- ✅ Screen sharing works over network
- ✅ All participants can use network IP address
- ✅ Works on LAN, WAN, and Internet

---

## 🚀 Quick Setup (Automatic)

### Option 1: Automatic Setup (Recommended)

Just run the start script - it will set up HTTPS automatically:

```bash
bash start-dev.sh
```

The script will:
1. Detect if SSL certificates don't exist
2. Generate self-signed certificates automatically
3. Start both frontend and backend with HTTPS
4. Show you the network URLs

### Option 2: Manual Setup

If you want to set up HTTPS manually:

```bash
# 1. Generate SSL certificates
bash setup_https.sh

# 2. Start the app
bash start-dev.sh
```

---

## 📋 How It Works

### Before (HTTP Only)
```
http://192.168.1.115:3000  ❌ Camera/Mic blocked by browser
http://localhost:3000       ✅ Works (localhost exception)
```

### After (HTTPS Enabled)
```
https://192.168.1.115:3000  ✅ Works! (like Teams/Zoom/Meet)
https://YOUR_IP:3000        ✅ Works on any network
```

---

## 🔐 Accepting the Self-Signed Certificate

### Chrome/Edge

1. Visit `https://YOUR_IP:3000`
2. See "Your connection is not private"
3. Click "Advanced"
4. Click "Proceed to YOUR_IP (unsafe)"
5. Certificate is accepted for this session

### Firefox

1. Visit `https://YOUR_IP:3000`
2. See "Warning: Potential Security Risk"
3. Click "Advanced"
4. Click "Accept the Risk and Continue"
5. Certificate is accepted

### Safari (macOS)

1. Visit `https://YOUR_IP:3000`
2. See certificate warning
3. Click "Show Details" → "visit this website"
4. Confirm acceptance
5. Certificate is stored

---

## 🌐 Access URLs

### Local Access
```bash
https://localhost:3000        # Local machine
https://127.0.0.1:3000       # Local machine
```

### Network Access (LAN/WAN/Internet)
```bash
# Get your IP address
hostname -I | awk '{print $1}'

# Example:
https://192.168.1.115:3000    # LAN
https://10.0.0.50:3000        # LAN
https://YOUR_PUBLIC_IP:3000   # Internet (if port forwarded)
```

### Backend API
```bash
https://YOUR_IP:5117/api      # API endpoint
https://YOUR_IP:5117/health   # Health check
```

---

## 🔧 Configuration Details

### SSL Certificate Location
```
ssl/
├── cert.pem     # Certificate (public)
└── key.pem      # Private key (secure)
```

### Certificate Details
- **Type**: Self-signed
- **Valid for**: 365 days
- **Subjects**: localhost, 127.0.0.1, owltalk.local
- **Key size**: 2048-bit RSA

### Security Notes
- ✅ Secure for local/network development
- ⚠️ Not suitable for public production
- ✅ Perfect for LAN meetings
- ⚠️ Browser will show warning (expected)

---

## 🎯 Use Cases

### 1. LAN Meetings (Office Network)
```
Connect all devices on same WiFi:
https://192.168.1.115:3000
```

**Features**:
- Voice calls ✅
- Video calls ✅
- Screen sharing ✅
- No external internet needed

### 2. WAN Access (Remote Access)
```
Access from home to office network:
https://PUBLIC_IP:3000
```

**Requirements**:
- Port forwarding (3000, 5117)
- Router/firewall configuration
- Public IP or DDNS

### 3. Internet Hosting (Public Server)
```
Deploy on cloud/VPS:
https://yourdomain.com:3000
```

**Recommended**:
- Use Let's Encrypt certificates
- Proper domain SSL
- Production server

---

## 🛠️ Advanced Configuration

### Generate Custom Certificate

```bash
# Create custom certificate with your domain
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Owl-talk/CN=yourdomain.local"
```

### Use Let's Encrypt (Production)

```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates to ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
```

### Docker Deployment

```bash
# Build with HTTPS
docker build -t owltalk:https .
docker run -p 3000:3000 -p 5117:5117 \
  -v $(pwd)/ssl:/app/ssl \
  owltalk:https
```

---

## 📊 Comparison: Before vs After

| Feature | HTTP (Before) | HTTPS (After) |
|---------|---------------|---------------|
| Localhost access | ✅ Works | ✅ Works |
| Network IP access | ❌ Camera/Mic blocked | ✅ Works |
| Voice calls | ❌ Only localhost | ✅ Any network |
| Video calls | ❌ Only localhost | ✅ Any network |
| Screen sharing | ❌ Only localhost | ✅ Any network |
| LAN meetings | ❌ No | ✅ Yes |
| Internet deployment | ❌ No | ✅ Yes |
| Like Teams/Zoom | ❌ No | ✅ Yes |

---

## 🔍 Troubleshooting

### Issue: "Certificate error" in browser

**Solution**:
1. Click "Advanced"
2. Click "Proceed anyway"
3. Certificate will be accepted

### Issue: "Certificate not trusted" permanently

**Solution** (Chrome):
1. Settings → Privacy and Security
2. Manage certificates
3. Add exception for `owltalk.local`

**Solution** (Firefox):
1. Settings → Privacy & Security
2. Certificates → View Certificates
3. Add exception for your IP

### Issue: Can't connect from other devices

**Check**:
```bash
# Verify certificates exist
ls -la ssl/

# Verify ports are open
netstat -tuln | grep 3000
netstat -tuln | grep 5117

# Test backend
curl -k https://YOUR_IP:5117/health
```

### Issue: "Connection refused"

**Solutions**:
1. Check firewall: `sudo ufw allow 3000,5117/tcp`
2. Check backend is running: `ps aux | grep python`
3. Check frontend is running: `ps aux | grep node`
4. Check IP address: `hostname -I`

---

## 🌍 Network Deployment Options

### 1. LAN Only (Office/Home Network)
```
✅ No internet required
✅ All devices on same WiFi
✅ Secure (internal network)
✅ Unlimited participants
```

### 2. LAN with Internet Gateway
```
✅ Remote access via VPN
✅ Secure tunnel
✅ Works from anywhere
```

### 3. Internet Hosting (Cloud/VPS)
```
✅ Public access
✅ Use Let's Encrypt
✅ Domain name required
✅ Firewall configuration
```

### 4. Tailscale/VPN (Recommended for Remote Teams)
```
✅ Secure mesh network
✅ No port forwarding
✅ Works through firewalls
✅ End-to-end encryption
```

---

## 📈 Performance

### Bandwidth Requirements

**Per Call**:
- Audio: ~50 KB/s
- Video (480p): ~500 KB/s
- Video (720p): ~1 MB/s
- Video (1080p): ~2-4 MB/s
- Screen sharing: ~2-4 MB/s

**Network Latency**:
- Local LAN: <5ms
- Same region: <50ms
- Different regions: <200ms

---

## 🔐 Security Best Practices

### Development (Self-Signed)
- ✅ Acceptable for LAN testing
- ✅ Password protect server
- ⚠️ Don't expose to internet
- ⚠️ Browser warning expected

### Production (Let's Encrypt)
- ✅ Use proper SSL certificates
- ✅ Enable firewall rules
- ✅ Use strong passwords
- ✅ Regular updates
- ✅ Monitor connections

---

## 📱 Mobile Access

### iOS (Safari)
1. Visit `https://YOUR_IP:3000`
2. Accept certificate warning
3. Tap "Trust" in Settings → General
4. Full functionality available

### Android (Chrome)
1. Visit `https://YOUR_IP:3000`
2. Accept certificate warning
3. Tap "Advanced" → "Proceed"
4. Full functionality available

---

## ✅ Summary

With HTTPS enabled, Owl-talk now works exactly like Microsoft Teams, Google Meet, and Zoom:

- ✅ Voice/video calls over network
- ✅ Screen sharing over network
- ✅ Accessible from any device
- ✅ LAN, WAN, and Internet support
- ✅ No localhost restrictions
- ✅ Production-ready architecture

Just run:
```bash
bash start-dev.sh
```

And access at:
```
https://YOUR_IP:3000
```

Accept the certificate once, and enjoy network-wide calling! 🎉

