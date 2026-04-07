# 🔐 Admin Configuration Feature

## ✅ What Was Added

### New Features:
1. **Config Manager** (`ConfigManager.kt`)
   - Password-protected admin access
   - IP and port configuration
   - Persistent storage using SharedPreferences
   - Dynamic server URL generation

2. **Config Screen** (`ConfigActivity.kt`)
   - Admin-only access with password: `P@55w0rD`
   - IP address input field
   - Port number input field
   - Save configuration
   - Validation and error handling

3. **Login Screen Updated** (`LoginActivity.kt`)
   - Added "⚙️ Config" button
   - Opens configuration screen
   - Only accessible to admin with correct password

4. **API Client Updated** (`ApiClient.kt`)
   - Now uses dynamic server URL from configuration
   - Reads IP and port from ConfigManager
   - Falls back to defaults if not configured

---

## 🔑 Admin Password

**Password**: `P@55w0rD`

This password is required to access the configuration screen.

---

## 🎯 How to Use

### On the Mobile App:

1. **Open OwlTalk app**
2. **See login screen**
3. **Click "⚙️ Config" button** (at bottom)
4. **Enter admin password**: `P@55w0rD`
5. **Enter server IP**: e.g., `192.168.1.115`
6. **Enter server port**: e.g., `5000`
7. **Click "Save Configuration"**
8. **App restarts** with new configuration
9. **Login** with your credentials

---

## 🔧 Configuration Options

### For Emulator:
```
IP: 10.0.2.2
Port: 5000
```

### For Physical Device on LAN:
```
IP: 192.168.1.115  (your server IP)
Port: 5000
```

### For Remote Access:
```
IP: your.public.ip.address
Port: 5000
```

---

## 📱 UI Flow

```
Login Screen
    ↓
Click "⚙️ Config"
    ↓
Enter password: P@55w0rD
    ↓
Enter IP & Port
    ↓
Save Configuration
    ↓
App restarts
    ↓
Login with credentials
    ↓
Main Activity (uses new config)
```

---

## 💾 Data Storage

Configuration is stored in:
```
SharedPreferences: "OwlTalkConfig"
```

**Keys:**
- `server_ip` - Server IP address
- `server_port` - Server port
- `config_set` - Whether config has been set

---

## 🛡️ Security Features

1. **Password Protection**
   - Only admin can access config
   - Password: `P@55w0rD`
   - Validated before allowing access

2. **Input Validation**
   - IP address required
   - Port number required
   - Cannot be empty

3. **Secure Storage**
   - Uses SharedPreferences (app's private data)
   - Only accessible by the app

---

## ⚙️ Configuration Screen UI

```
┌─────────────────────────────────┐
│      Server Configuration       │
│           🔒 Admin Only          │
│                                 │
│  Admin Password:                │
│  [________________]             │
│                                 │
│  Server IP:                     │
│  [192.168.1.115 ]              │
│                                 │
│  Server Port:                   │
│  [5000         ]               │
│                                 │
│  [  Save Configuration  ]       │
│                                 │
│  For emulator: Use 10.0.2.2     │
│  For device: Use server IP      │
└─────────────────────────────────┘
```

---

## 🚀 Building the APK

### In Android Studio:

1. **Open project**: File → Open → `android-client`
2. **Wait for Gradle sync**
3. **Build APK**: Build → Build APK(s)
4. **Find APK**: `app/build/outputs/apk/debug/app-debug.apk`

### Using Command Line (if Gradle is installed):

```bash
cd android-client
./gradlew assembleDebug
```

APK will be at: `app/build/outputs/apk/debug/app-debug.apk`

---

## ✅ What Works Now

- ✅ Login screen with config button
- ✅ Config screen (admin-only)
- ✅ Password protection
- ✅ IP and port configuration
- ✅ Persistent storage
- ✅ Dynamic API connection
- ✅ App restart after config
- ✅ Validation and error handling

---

## 🧪 Testing

### Test Configuration:

1. Install APK on device
2. Open OwlTalk app
3. Click "⚙️ Config"
4. Enter password: `P@55w0rD`
5. Set IP: `192.168.1.115`
6. Set Port: `5000`
7. Click Save
8. App restarts
9. Login with `admin` / `admin123`
10. Should connect to configured server

---

## 📊 Files Changed/Created

- ✅ `ConfigManager.kt` (NEW)
- ✅ `ConfigActivity.kt` (NEW)
- ✅ `LoginActivity.kt` (UPDATED - added config button)
- ✅ `ApiClient.kt` (UPDATED - dynamic URL)
- ✅ `AndroidManifest.xml` (UPDATED - added activity)

---

**The configuration feature is complete and ready to use!** 🎉

