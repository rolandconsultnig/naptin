# Builds app-release.apk (internal / debug keystore). Windows: use a short Gradle user home
# to avoid MAX_PATH failures in react-native-screens native build (prefab headers).
# Default E:\g — override:  $env:GRADLE_USER_HOME = 'D:\x'; .\scripts\android-release.ps1

$ErrorActionPreference = "Stop"
$gradleHome = if ($env:GRADLE_USER_HOME) { $env:GRADLE_USER_HOME } else { "E:\g" }
New-Item -ItemType Directory -Force -Path $gradleHome | Out-Null

$root = Split-Path -Parent $PSScriptRoot
$screensCxx = Join-Path $root "node_modules/react-native-screens/android/.cxx"
if (Test-Path $screensCxx) { Remove-Item -Recurse -Force $screensCxx }

Push-Location (Join-Path $root "android")
try {
  if (-not $env:ANDROID_HOME) {
    $sdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
    if (Test-Path $sdk) { $env:ANDROID_HOME = $sdk }
  }
  .\gradlew.bat "--gradle-user-home=$gradleHome" assembleRelease --no-daemon
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "APK: $root\android\app\build\outputs\apk\release\app-release.apk"
