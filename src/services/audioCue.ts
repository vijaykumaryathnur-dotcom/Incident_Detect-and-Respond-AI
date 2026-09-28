/**
 * Professional SRE Web Audio Cue Synthesizer
 * 
 * Generates an acoustic, warm, dual-resonance harmonic chime designed specifically
 * for critical engineering alerts without using external audio files or harsh square waves.
 */

class AudioCueService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    try {
      const stored = localStorage.getItem('sre_audio_cue_enabled');
      if (stored !== null) {
        this.soundEnabled = stored === 'true';
      }
    } catch {
      this.soundEnabled = true;
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Ignored if browser requires user gesture
      });
    }

    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    try {
      localStorage.setItem('sre_audio_cue_enabled', String(enabled));
    } catch {
      // Ignore in restricted environments
    }
  }

  public toggle(): boolean {
    const nextState = !this.soundEnabled;
    this.setEnabled(nextState);
    if (nextState) {
      // Play a quick subtle confirmation tick
      this.playTone(660, 0.08, 0.05, 'sine');
    }
    return nextState;
  }

  /**
   * Synthesize high-fidelity P1 alert chime:
   * Tone 1: 520Hz (fundamental warm C5 with sub-harmonic body)
   * Tone 2: 780Hz (overtone E5/G5 harmonic chime 110ms later)
   * Low-pass filter at 2400Hz gives a smooth, executive, non-fatiguing timbre
   */
  public playP1Alert(): void {
    if (!this.soundEnabled) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Master output limiter and filter
      const masterFilter = ctx.createBiquadFilter();
      masterFilter.type = 'lowpass';
      masterFilter.frequency.setValueAtTime(2400, now);
      masterFilter.Q.setValueAtTime(1.1, now);
      masterFilter.connect(ctx.destination);

      // --- PULSE 1: Fundamental Alert Tone (523Hz) ---
      const osc1 = ctx.createOscillator();
      const osc1Sub = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      // Slight pitch glissando upwards (523 -> 554) gives an alert rise feeling
      osc1.frequency.exponentialRampToValueAtTime(554.37, now + 0.08);

      osc1Sub.type = 'triangle';
      osc1Sub.frequency.setValueAtTime(261.63, now); // C4 sub-warmth

      // Attack & Exponential Decay
      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.linearRampToValueAtTime(0.14, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc1.connect(gain1);
      osc1Sub.connect(gain1);
      gain1.connect(masterFilter);

      osc1.start(now);
      osc1Sub.start(now);
      osc1.stop(now + 0.3);
      osc1Sub.stop(now + 0.3);

      // --- PULSE 2: Elevated Harmonic Resolution (784Hz / G5) ---
      const t2 = now + 0.11;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, t2); // G5 harmonic

      gain2.gain.setValueAtTime(0.0001, t2);
      gain2.gain.linearRampToValueAtTime(0.11, t2 + 0.018);
      gain2.gain.exponentialRampToValueAtTime(0.0008, t2 + 0.36);

      osc2.connect(gain2);
      gain2.connect(masterFilter);

      osc2.start(t2);
      osc2.stop(t2 + 0.38);

    } catch (err) {
      console.warn('Audio cue failed or was suppressed by browser policy:', err);
    }
  }

  private playTone(freq: number, duration: number, volume: number, type: OscillatorType = 'sine'): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Ignored
    }
  }
}

export const audioCueService = new AudioCueService();
