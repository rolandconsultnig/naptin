# How to Access Owl-Talk for Call Features

## ⚠️ IMPORTANT: Use the Correct URL

For voice and video calls to work, you **MUST** access the app via localhost.

## ✅ CORRECT Way (Works for Calls)

```
http://localhost:3000
```

**OR**

```
http://127.0.0.1:3000
```

## ❌ WRONG Way (Call features won't work)

```
http://192.168.1.115:3000   ❌ NO
http://192.168.1.115:3001   ❌ NO
http://YOUR_LAN_IP:3000     ❌ NO
```

## Why?

Modern browsers block camera/microphone access unless you're on:
- ✅ `localhost` or `127.0.0.1`
- ✅ HTTPS (https://)
- ❌ Network IP addresses (http://192.168.x.x)

This is a security feature to prevent malicious websites from accessing your camera/microphone.

## Current Running Services

✅ **Frontend**: http://localhost:3000  
✅ **Backend**: http://localhost:5117  
✅ **Socket.IO**: http://localhost:5117

## Quick Test

### Step 1: Open Browser
Open Chrome, Firefox, or Edge

### Step 2: Go to
```
http://localhost:3000
```

### Step 3: Login
- Username: `admin`
- Password: `admin`

### Step 4: Start a Call
1. Click the phone icon next to any user
2. Choose "Voice Call" or "Video Call"
3. **Grant camera/microphone permissions** when prompted
4. Call should work! ✅

## What Happens if You Use Network IP?

If you access via `http://192.168.1.115:3000`:

- ✅ Login works
- ✅ Chat works
- ✅ File sharing works
- ✅ Messaging works
- ❌ **Voice calls won't work**
- ❌ **Video calls won't work**
- ❌ **Screen sharing won't work**
- ❌ **Voice messages won't work**

You'll see this error:
```
Camera/microphone access is not supported in this browser. 
Please use HTTPS or localhost.
```

## Testing Calls from Another Computer

If you need to test from another device on your network:

### Option 1: Use the Network IP (Chat Only)
```
http://192.168.1.115:3000
```
- Can chat, send messages, share files
- Cannot make voice/video calls
- Cannot send voice messages

### Option 2: Use localhost (Full Features)
From your computer:
```
http://localhost:3000
```
- All features work including calls

## Checking Current Status

```bash
# Check if services are running
curl http://localhost:5117/health
curl http://localhost:3000/
```

## Troubleshooting

### Issue: "Camera/microphone access is not supported"

**Solution**:
1. Make sure you're using `http://localhost:3000` (not the IP)
2. Make sure ports 3000 and 5117 are both running
3. Grant permissions when browser asks

### Issue: "Services not responding"

**Check**:
```bash
# Check what's running on port 3000
lsof -i :3000

# Check what's running on port 5117
lsof -i :5117
```

### Issue: "Port 3000 is in use"

**Solution**:
```bash
# Find what's using it
lsof -i :3000

# Kill it (replace PID with actual process ID)
kill -9 PID

# Restart the app
bash start-dev.sh
```

## Summary

| Access Method | Chat | Calls | Recommended |
|---------------|------|-------|-------------|
| localhost:3000 | ✅ | ✅ | ✅ YES |
| 127.0.0.1:3000 | ✅ | ✅ | ✅ YES |
| LAN_IP:3000 | ✅ | ❌ | ⚠️ Chat only |

**For full functionality with voice/video calling, always use localhost!**

