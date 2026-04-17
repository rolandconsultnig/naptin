const { withProjectBuildGradle } = require('expo/config-plugins')

const SNIPPET = `
// NAPTIN: all com.android.library modules minSdk 24 (Hermes prefab / CXX1214).
subprojects { subproject ->
  subproject.plugins.withId("com.android.library") {
    subproject.android {
      defaultConfig {
        minSdkVersion 24
      }
    }
  }
}

// NAPTIN: Expo catalog NDK 27.1.x may be a partial install on disk; use a complete side-by-side NDK.
ext.ndkVersion = "27.3.13750724"
`

module.exports = function withAndroidLibraryMinSdk(config) {
  return withProjectBuildGradle(config, (mod) => {
    if (!mod.modResults.contents.includes('NAPTIN: all com.android.library')) {
      mod.modResults.contents += SNIPPET
    }
    return mod
  })
}
