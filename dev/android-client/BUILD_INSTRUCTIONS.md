# Building OwlTalk Android APK

## Prerequisites

You need Android SDK to build the APK. Here are the options:

### Option 1: Install Android Studio (Recommended)

1. Download Android Studio from https://developer.android.com/studio
2. Install it
3. Open this project: `File → Open → Select android-client folder`
4. Wait for Gradle sync
5. Build: `Build → Build Bundle(s) / APK(s) → Build APK(s)`
6. Find APK: `app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Use Command Line (if Android SDK is installed)

```bash
cd android-client

# Make gradlew executable
chmod +x gradlew

# Build debug APK
./gradlew assembleDebug

# APK will be in: app/build/outputs/apk/debug/app-debug.apk
```

### Option 3: Install Android SDK Only

```bash
# Download command-line tools
wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip

# Extract
unzip commandlinetools-linux-9477386_latest.zip

# Install SDK
mkdir -p ~/Android/Sdk
sdkmanager --sdk_root=~/Android/Sdk "platform-tools" "build-tools;34.0.0" "platforms;android-34"
```

---

## Build Commands

### Debug APK (for testing)
```bash
cd android-client
./gradlew assembleDebug
```

### Release APK (for production)
```bash
cd android-client
./gradlew assembleRelease
```

### Install APK on connected device
```bash
# Connect device via USB and enable USB debugging
adb devices

# Install APK
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## APK Location

After building, find your APK at:

- **Debug**: `app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `app/build/outputs/apk/release/app-release.apk`

---

## Troubleshooting

### Error: Gradle not found
- Install Android Studio (includes Gradle)
- Or install Gradle manually: https://gradle.org/install/

### Error: Android SDK not found
- Set ANDROID_HOME environment variable:
  ```bash
  export ANDROID_HOME=$HOME/Android/Sdk
  export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
  ```

### Build fails
- Clean build: `./gradlew clean`
- Sync Gradle in Android Studio
- Check Android SDK is installed

---

## Current Status

✅ Project structure created
✅ Source files added (minimal working version)
✅ Dependencies configured
✅ Build.gradle configured
⚠️  Ready to build when Android SDK is installed

---

## What's in the APK

The current build includes:
- Login screen
- Main activity (welcome screen)
- Network API client
- Basic UI (programmatic layout)

**Note**: This is a minimal working version. Full features need to be implemented.

---

## Next Steps

1. Install Android Studio
2. Open project
3. Sync Gradle
4. Build APK
5. Install on device/emulator
6. Test connection to server

