/**
 * Procedural sound effects using Web Audio API.
 * No external audio files needed.
 * Respects user preferences stored in localStorage.
 */

const PREFS_KEY = 'gtt_preferences';

function areSoundsEnabled() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return true;
    return JSON.parse(raw).sounds !== false;
  } catch {
    return true;
  }
}

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a short "pop" sound when completing a task.
 */
export function playCompleteSound() {
  if (!areSoundsEnabled()) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Oscillator: quick rising tone
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);

    // Second harmonic for richness
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(900, now);
    osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.08);

    // Volume envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.08, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain).connect(ctx.destination);
    osc2.connect(gain2).connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
    osc2.start(now);
    osc2.stop(now + 0.15);
  } catch {
    // Silently fail if audio isn't available
  }
}

/**
 * Play a celebratory "chime" sound for badge unlocks.
 */
export function playBadgeSound() {
  if (!areSoundsEnabled()) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Three-note ascending arpeggio
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.3);

      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.3);
    });
  } catch {
    // Silently fail if audio isn't available
  }
}
