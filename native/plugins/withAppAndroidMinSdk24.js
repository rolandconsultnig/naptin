const { withAppBuildGradle } = require('expo/config-plugins')

/** CMake / prefab for :app still saw min 22 unless defaultConfig pins API 24. */
module.exports = function withAppAndroidMinSdk24(config) {
  return withAppBuildGradle(config, (mod) => {
    let c = mod.modResults.contents
    c = c.replace(/minSdkVersion rootProject\.ext\.minSdkVersion/, 'minSdkVersion 24')
    c = c.replace(/ndkVersion rootProject\.ext\.ndkVersion/, 'ndkVersion "27.3.13750724"')
    mod.modResults.contents = c
    return mod
  })
}
