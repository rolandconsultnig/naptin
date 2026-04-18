/**
 * Mirrors URL/path classification in `src/chat/chatConfig.js` (no Vite / window).
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

const IMAGE_EXT_IN_PATH = /\.(jpe?g|png|gif|webp)(\?|#|$)/i
const AUDIO_EXT_IN_PATH = /\.(webm|ogg|mp3|wav|m4a)(\?|#|$)/i

function inferChatMessageType(content) {
  const c = String(content ?? '').trim()
  if (!c) return 'text'
  if (/\s/.test(c)) return 'text'
  if (c.startsWith('/static/') || c.startsWith('http://') || c.startsWith('https://')) {
    if (IMAGE_EXT_IN_PATH.test(c)) return 'image'
    if (AUDIO_EXT_IN_PATH.test(c)) return 'audio'
  }
  return 'text'
}

test('inferChatMessageType: image path', () => {
  assert.equal(inferChatMessageType('/static/uploads/x.png'), 'image')
  assert.equal(inferChatMessageType('https://ex.com/a.JPG'), 'image')
})

test('inferChatMessageType: audio path', () => {
  assert.equal(inferChatMessageType('/static/uploads/v.webm'), 'audio')
})

test('inferChatMessageType: text when spaces or no media', () => {
  assert.equal(inferChatMessageType('/static/a b.png'), 'text')
  assert.equal(inferChatMessageType('hello'), 'text')
})
