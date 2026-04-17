import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const androidDir = path.join(__dirname, '..', 'android')
const isWin = process.platform === 'win32'
const variant = (process.argv[2] || 'debug').toLowerCase()
const task = variant === 'release' ? 'assembleRelease' : 'assembleDebug'

const gradlew = isWin
  ? path.join(androidDir, 'gradlew.bat')
  : path.join(androidDir, 'gradlew')

if (!fs.existsSync(gradlew)) {
  console.error('Missing android/ Gradle wrapper. From repo root run: npx cap add android')
  process.exit(1)
}

function hasAndroidSdk() {
  if (process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT) return true
  const lp = path.join(androidDir, 'local.properties')
  if (!fs.existsSync(lp)) return false
  return /\bsdk\.dir\s*=/.test(fs.readFileSync(lp, 'utf8'))
}

if (!hasAndroidSdk()) {
  console.error(
    'Android SDK not found. Install Android Studio, then either:\n' +
      '  - Set ANDROID_HOME (or ANDROID_SDK_ROOT) to your SDK path, or\n' +
      '  - Let Android Studio open the android/ folder once (it creates local.properties).'
  )
  process.exit(1)
}

const r = spawnSync(gradlew, [task], {
  cwd: androidDir,
  stdio: 'inherit',
  shell: isWin,
})

if (r.status !== 0) process.exit(r.status ?? 1)

const outDir =
  variant === 'release'
    ? path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release')
    : path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug')

const name = variant === 'release' ? 'app-release.apk' : 'app-debug.apk'
const apk = path.join(outDir, name)
console.log(`\nAPK (internal): ${apk}`)
