// Audio notification utility for the app

/**
 * Play a notification sound
 * @param {string} type - Type of notification: 'message', 'call', 'video'
 */
export function playNotificationSound(type = 'message') {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return

  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  // Set frequency and duration based on notification type
  switch (type) {
    case 'call':
      // Higher frequency for calls
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
      break

    case 'video':
      // Different pattern for video calls
      oscillator.frequency.value = 600
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator()
        const gainNode2 = audioContext.createGain()
        oscillator2.connect(gainNode2)
        gainNode2.connect(audioContext.destination)
        oscillator2.frequency.value = 600
        oscillator2.type = 'sine'
        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        oscillator2.start(audioContext.currentTime + 0.4)
        oscillator2.stop(audioContext.currentTime + 0.7)
      }, 100)
      break

    case 'message':
    default:
      // Short beep for messages
      oscillator.frequency.value = 400
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
      break
  }
}

/**
 * Play vibration pattern (if supported)
 */
export function vibrate(pattern = [100, 50, 100]) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

/**
 * Play notification with sound and vibration
 */
export function notify(type = 'message') {
  playNotificationSound(type)
  vibrate([100, 50, 100])
}

