# 🚀 First Build Guide - Android Studio

## Quick Steps to Build Your APK

### Step 1: Open Project in Android Studio

1. **Launch Android Studio**

2. **Open the Project**:
   - Click "Open" (or File → Open)
   - Navigate to: `/home/fes/Downloads/dev/android-client`
   - Click "OK"

3. **Wait for Gradle Sync** (5-10 minutes first time):
   - Android Studio will automatically:
     - Download Gradle wrapper
     - Download all dependencies
     - Sync project files
     - Index code
   
   **Look for**: "Gradle sync completed" in the bottom status bar

---

### Step 2: Configure Project (If Needed)

#### Check SDK Settings
1. Go to: **File → Project Structure**
2. Check: **SDK Location** is set
3. Check: **Compile SDK Version** = 34
4. Check: **Min SDK Version** = 24

#### Check Java Version
1. Go to: **File → Project Structure → SDK Location**
2. Check JDK version (should be Java 17 or 18)

---

### Step 3: Build the APK

#### Method 1: Build Menu
1. Click **Build** in menu bar
2. Select **Build Bundle(s) / APK(s)**
3. Select **Build APK(s)**
4. Wait for build to complete (1-2 minutes)

#### Method 2: Gradle Panel
1. Click **View → Tool Windows → Gradle**
2. Expand: **app → Tasks → build**
3. Double-click: **assembleDebug**

#### What Happens
```
> Task :app:assembleDebug
BUILD SUCCESSFUL in 1m 23s
```

**APK Location**: `app/build/outputs/apk/debug/app-debug.apk`

---

### Step 4: Find Your APK

After successful build:

1. **In Android Studio**:
   - Click notification: "APK(s) generated successfully"
   - Click: "locate"

2. **Or manually**:
   - Navigate to: `android-client/app/build/outputs/apk/debug/`
   - Find: `app-debug.apk`

---

### Step 5: Install & Test

#### Install on Device
```bash
# Connect Android device via USB
# Enable USB debugging on device

# Install APK
adb install app/build/outputs/apk/debug/app-debug.apk

# Or just copy APK to phone and install manually
```

#### Test the App
1. Open OwlTalk app on device
2. Enter username: `admin`
3. Enter password: `admin123`
4. Click "Login"
5. Should show "Login successful!" if server is running

---

## 🐛 Troubleshooting

### "Gradle sync failed"
- **Fix**: File → Invalidate Caches → Invalidate and Restart
- **Fix**: Check internet connection (needs to download dependencies)
- **Fix**: Check Android SDK is installed

### "SDK not found"
- Go to: **File → Settings → Appearance & Behavior → System Settings → Android SDK**
- Install any missing SDK components

### "Build failed: duplicate entries"
- **Fix**: Build → Clean Project
- **Fix**: Then Build → Rebuild Project

### APK won't install
- Enable "Install from Unknown Sources" in device settings
- Or use: `adb install -r app-debug.apk`

### App crashes on startup
- Check Logcat in Android Studio
- Verify server is running
- Check network permissions

---

## 🎯 Expected First Build

### Build Output (Example)
```
BUILD SUCCESSFUL

Total time: 2 min 23 sec
27 actionable tasks: 27 executed

APK generated at:
  android-client/app/build/outputs/apk/debug/app-debug.apk
```

### APK Info
- **Size**: ~5-10 MB
- **Format**: APK (Android Package)
- **Type**: Debug build (for testing)
- **Version**: 1.0 (versionCode: 1)

---

## ✅ Build Checklist

- [ ] Android Studio opened
- [ ] Project opened successfully
- [ ] Gradle sync completed
- [ ] No errors in Event Log
- [ ] Build completed successfully
- [ ] APK generated in outputs folder
- [ ] APK installed on device
- [ ] App opens successfully
- [ ] Login screen displays
- [ ] Can connect to server (if running)

---

## 🎉 Success!

If you see "BUILD SUCCESSFUL", you're done! 🎊

Your APK is ready at:
```
android-client/app/build/outputs/apk/debug/app-debug.apk
```

**Next Steps**:
1. Install on device
2. Test login
3. Continue developing features (chat, calls, etc.)

---

## 📝 Notes

- First build takes longest (downloading dependencies)
- Subsequent builds take 30-60 seconds
- Debug APK is for testing only
- For release APK, use "Build → Generate Signed Bundle/APK"

**Happy Building!** 🚀

