import { AlarmConfig, AlarmSoundId } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

let activeAlarmStopFn: (() => void) | null = null;
let customAudioElement: HTMLAudioElement | null = null;

/**
 * Play the "mubimu" voice and audio sound effect
 */
export function playMubimuSound(volume = 0.9): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Quirky 3-tone vocal chime: "Mu - Bi - Mu"
    const notes = [
      { freq: 440, start: 0.0, dur: 0.12 },
      { freq: 330, start: 0.13, dur: 0.14 },
      { freq: 659.25, start: 0.28, dur: 0.25 }
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Bandpass formant filter for vocal cartoon character feel
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(n.freq * 1.5, now + n.start);
      filter.Q.setValueAtTime(3.5, now + n.start);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, now + n.start);
      // Small vibrato
      osc.frequency.exponentialRampToValueAtTime(n.freq * 1.04, now + n.start + n.dur);

      gain.gain.setValueAtTime(0.001, now + n.start);
      gain.gain.linearRampToValueAtTime(volume * 0.4, now + n.start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.start);
      osc.stop(now + n.start + n.dur + 0.05);
    });

    // Also speak "mubimu" using SpeechSynthesis if available
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('mubimu');
      utterance.lang = 'es-ES';
      utterance.pitch = 1.7; // high playful cartoon pitch
      utterance.rate = 1.3;
      utterance.volume = volume;
      window.speechSynthesis.speak(utterance);
    }
  } catch (err) {
    console.warn('Error playing mubimu audio:', err);
  }
}

/**
 * Stop any ongoing alarm sound
 */
export function stopCurrentAlarm(): void {
  if (activeAlarmStopFn) {
    activeAlarmStopFn();
    activeAlarmStopFn = null;
  }
  if (customAudioElement) {
    customAudioElement.pause();
    customAudioElement.currentTime = 0;
    customAudioElement = null;
  }
}

/**
 * Play the configured alarm sound
 */
export function playAlarmSound(config: AlarmConfig, onEnded?: () => void): () => void {
  stopCurrentAlarm();

  const volume = Math.max(0, Math.min(1, config.volume));

  // If custom audio provided
  if (config.soundId === 'custom_audio' && config.customAudioUrl) {
    try {
      const audio = new Audio(config.customAudioUrl);
      audio.volume = volume;
      audio.play().catch((e) => console.warn('Failed custom audio playback:', e));
      customAudioElement = audio;
      audio.onended = () => {
        if (onEnded) onEnded();
      };
      const stopFn = () => {
        audio.pause();
        audio.currentTime = 0;
      };
      activeAlarmStopFn = stopFn;
      return stopFn;
    } catch (e) {
      console.warn('Falling back to default chime due to error:', e);
    }
  }

  const ctx = getAudioContext();
  let isCancelled = false;
  const scheduledTimeouts: number[] = [];

  const stopAlarm = () => {
    isCancelled = true;
    scheduledTimeouts.forEach((id) => clearTimeout(id));
  };
  activeAlarmStopFn = stopAlarm;

  const playSequence = (iteration: number) => {
    if (isCancelled) return;
    const now = ctx.currentTime;

    switch (config.soundId) {
      case 'digital_beep': {
        // 4 rapid digital beeps
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(987.77, now + i * 0.15); // B5
          gain.gain.setValueAtTime(0.001, now + i * 0.15);
          gain.gain.linearRampToValueAtTime(volume * 0.3, now + i * 0.15 + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.09);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.1);
        }
        break;
      }

      case 'gentle_chime': {
        // E maj chime chords: E5, G#5, B5, E6
        const chimeNotes = [659.25, 830.61, 987.77, 1318.51];
        chimeNotes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.16);

          gain.gain.setValueAtTime(0.001, now + i * 0.16);
          gain.gain.linearRampToValueAtTime(volume * 0.35, now + i * 0.16 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.16 + 1.2);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.16);
          osc.stop(now + i * 0.16 + 1.25);
        });
        break;
      }

      case 'retro_arcade': {
        // High upbeat 8-bit game victory
        const retroMelody = [
          { f: 523.25, d: 0.08 }, // C5
          { f: 659.25, d: 0.08 }, // E5
          { f: 783.99, d: 0.08 }, // G5
          { f: 1046.5, d: 0.15 }, // C6
          { f: 783.99, d: 0.08 },
          { f: 1046.5, d: 0.35 }
        ];
        let t = 0;
        retroMelody.forEach((item) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(item.f, now + t);

          gain.gain.setValueAtTime(0.001, now + t);
          gain.gain.linearRampToValueAtTime(volume * 0.25, now + t + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + t + item.d);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + t);
          osc.stop(now + t + item.d + 0.02);
          t += item.d + 0.02;
        });
        break;
      }

      case 'urgent_siren': {
        // High urgency sweeping siren
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(1100, now + 0.35);
        osc.frequency.linearRampToValueAtTime(600, now + 0.7);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
        break;
      }

      case 'mubimu_party': {
        // Playful bounce melody
        const partyMelody = [440, 554.37, 659.25, 880, 740, 880];
        partyMelody.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0.001, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(volume * 0.35, now + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.15);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.18);
        });
        break;
      }

      case 'cosmic_gong':
      default: {
        // Deep gong fundamental + harmonics
        const harmonics = [110, 220, 330, 445, 670];
        harmonics.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);

          const weight = 1 / (idx + 1);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(volume * 0.35 * weight, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 2.1);
        });
        break;
      }
    }

    const nextIteration = iteration + 1;
    const maxIterations = config.repeatCount || 3;

    if (nextIteration < maxIterations && !isCancelled) {
      const delay = config.soundId === 'cosmic_gong' ? 1800 : 950;
      const timeoutId = window.setTimeout(() => {
        playSequence(nextIteration);
      }, delay);
      scheduledTimeouts.push(timeoutId);
    } else {
      const finalTimeout = window.setTimeout(() => {
        if (!isCancelled && onEnded) {
          onEnded();
        }
      }, 1000);
      scheduledTimeouts.push(finalTimeout);
    }
  };

  playSequence(0);
  return stopAlarm;
}
