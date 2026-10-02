// Web Speech API helper (shared by cards and the listening check)
let nativeVoice = null
let voiceLoaded = false

export function canSpeak() {
  return typeof window !== 'undefined'
    && 'speechSynthesis' in window
    && typeof window.SpeechSynthesisUtterance !== 'undefined'
}

function findNativeVoice() {
  if (voiceLoaded) return nativeVoice
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) return null
  voiceLoaded = true
  // Prefer high-quality en-US voices
  const preferred = ['Samantha', 'Alex', 'Karen', 'Daniel', 'Moira', 'Google US English', 'Google UK English']
  for (const name of preferred) {
    const v = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'))
    if (v) { nativeVoice = v; return v }
  }
  // Fallback: any en-US or en-GB voice
  nativeVoice = voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en')) || null
  return nativeVoice
}

// Pre-load voices
try {
  if (canSpeak()) {
    window.speechSynthesis.onvoiceschanged = () => { voiceLoaded = false; findNativeVoice() }
    findNativeVoice()
  }
} catch (_) { /* silent fail */ }

export function speak(word) {
  try {
    if (!canSpeak()) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(word)
    u.lang   = 'en-US'
    u.rate   = 0.85
    u.pitch  = 1.0
    u.volume = 1
    const voice = findNativeVoice()
    if (voice) u.voice = voice
    window.speechSynthesis.speak(u)
  } catch (_) { /* silent fail */ }
}
