# 📱 Build APK in Android Studio (Recommended)

## 🚀 Quick Steps

### 1. Open Android Studio

Launch your Android Studio application.

---

### 2. Open Project

1. Click **"Open"** on the welcome screen
2. OR: **File → Open**
3. Navigate to: `/home/fes/Downloads/dev/android-client`
4. Click **OK**

---

### 3. Wait for Gradle Sync

Android Studio will automatically:
- Download Gradle 8.4 (if needed)
- Download all dependencies (~200MB)
- Sync project files
- Index code

**Time**: 5-10 minutes (first time only)

**You'll see**:
- Progress bar at bottom
- "Gradle sync..." message
- Download progress

**When done**: "Gradle sync completed" ✅

---

### 4. Build APK

#### Method 1: Menu
1. Click **Build** (top menu)
2. Select **Build Bundle(s) / APK(s)**
3. Select **Build APK(s)**
4. Wait for completion

#### Method 2: Gradle Panel
1. Click **View → Tool Windows → Gradle**
2. Expand: **app → Tasks → build**
3. Double-click: **assembleDebug**

#### Build Time: 1-3 minutes

---

### 5. Get Your APK

After build completes:

1. **See notification**: "APK(s) generated successfully"
2. **Click "locate"** in notification
3. **Or manually**: `app/build/outputs/apk/debug/app-debug.apk`

---

## ✅ Done!

Your APK is ready. Install and use:

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 📱 Using Your App

### Configuration:

1. **Open OwlTalk**
2. **Click "⚙️ Config"** button
3. **Enter password**: `P@55w0rD`
4. **Set IP**: Your server IP
5. **Set Port**: `5000`
6. **Save**
7. **Login** with credentials

---

## 🎯 Features in Your APK

✅ Login screen
✅ Admin configuration (password: P@55w0rD)
✅ Dynamic IP and port
✅ API integration
✅ Beautiful UI
✅ Error handling

---

## ⏱️ Expected Build Time

**First Time**: 6-13 minutes
- Gradle download: 2-5 mins
- Dependencies: 3-6 mins
- Build: 1-2 mins

**Subsequent**: 1-2 minutes
- Gradle sync: < 10 sec
- Build: 30-60 sec

---

## 🐛 Troubleshooting

### Gradle sync fails
- Check internet connection
- File → Invalidate Caches → Restart

### Build fails
- Build → Clean Project
- Then Build → Rebuild Project

### APK won't generate
- Check Event Log for errors
- Try: Build → Rebuild Project

---

**Ready to build! Open Android Studio and follow steps above.** 🚀

