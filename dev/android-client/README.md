# OwlTalk Android Client 🦉

Native Android application for OwlTalk messaging and video calling platform.

## 📱 Features

- ✅ **Authentication** - Login and registration
- ✅ **Real-time Chat** - Messaging with Socket.IO
- ✅ **Voice Calls** - Audio calling with WebRTC
- ✅ **Video Calls** - Video calling with WebRTC
- ✅ **User Management** - Profile and contacts
- ✅ **Media Sharing** - Photos, videos, documents
- ✅ **Screen Sharing** - Share screen during calls
- ✅ **Push Notifications** - Call and message alerts

## 🛠️ Tech Stack

- **Language**: Kotlin
- **UI**: Jetpack Compose (modern) + XML layouts (legacy)
- **Networking**: Retrofit + OkHttp
- **WebSocket**: Socket.IO
- **WebRTC**: Google WebRTC
- **Image Loading**: Glide
- **Architecture**: MVVM

## 📋 Prerequisites

- Android Studio Hedgehog or later
- JDK 17 or later
- Android SDK 24+
- Backend server running on `http://YOUR_SERVER:5000`

## 🚀 Setup Instructions

### 1. Configure API Endpoint

Edit `app/src/main/java/com/owltalk/api/ApiClient.kt`:

```kotlin
private const val BASE_URL = "http://YOUR_SERVER_IP:5000/api/"
```

### 2. Build and Run

```bash
# Clone project
cd android-client

# Build APK
./gradlew assembleDebug

# Install on device
adb install app/build/outputs/apk/debug/app-debug.apk
```

Or open in Android Studio:
1. File → Open → Select `android-client` folder
2. Wait for Gradle sync
3. Run (Shift + F10)

## 📂 Project Structure

```
android-client/
├── app/
│   ├── src/main/
│   │   ├── java/com/owltalk/
│   │   │   ├── api/          # API clients
│   │   │   ├── models/       # Data models
│   │   │   ├── ui/           # Activities & Fragments
│   │   │   │   ├── auth/     # Login/Register
│   │   │   │   ├── chat/     # Chat interface
│   │   │   │   └── call/     # Call interface
│   │   │   ├── webrtc/       # WebRTC implementation
│   │   │   └── websocket/    # Socket.IO client
│   │   ├── res/              # Resources
│   │   │   ├── layout/       # XML layouts
│   │   │   ├── drawable/     # Icons/images
│   │   │   └── values/       # Strings/colors
│   │   └── AndroidManifest.xml
│   └── build.gradle
├── build.gradle
└── settings.gradle
```

## 🌐 API Endpoints Used

### Authentication
- `POST /api/register` - Create account
- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `GET /api/me` - Current user

### Users
- `GET /api/users` - Get all users
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile

### Messages
- `GET /api/messages/:id` - Get conversation
- `POST /api/messages` - Send message
- `DELETE /api/messages/:id` - Delete message

### Calls
- WebSocket events for call signaling

## 📱 Screens

### Login Screen
- Username/password input
- Login button
- Register option

### Chat List
- List of conversations
- Unread count badges
- Online status indicators

### Chat Screen
- Message bubbles
- Text input
- Attachment button
- Call buttons

### Call Screen
- Video/audio call interface
- Controls (mute, video, end)
- Remote stream display

## 🔐 Permissions

App requires:
- **INTERNET** - Network access
- **CAMERA** - Video calls
- **RECORD_AUDIO** - Voice calls
- **READ_MEDIA** - Media sharing

## 🧪 Testing

### Unit Tests
```bash
./gradlew test
```

### Instrumentation Tests
```bash
./gradlew connectedAndroidTest
```

## 📦 Build Variants

- **Debug**: Development builds
- **Release**: Production APK

Generate release APK:
```bash
./gradlew assembleRelease
```

## 🐛 Troubleshooting

### Build Errors
```bash
# Clean build
./gradlew clean

# Sync Gradle
./gradlew --refresh-dependencies
```

### WebRTC Issues
- Ensure HTTPS is enabled on backend
- Check firewall settings
- Verify network connectivity

### Socket.IO Connection
- Check server is running
- Verify IP address in config
- Check firewall/network settings

## 📄 License

MIT License - OwlTalk Android Client

## 👨‍💻 Development

For contributions, see the main [OwlTalk repository](../../README.md).

