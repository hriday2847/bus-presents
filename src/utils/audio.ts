// Client-side Web Audio API ambient tone synthesizer

class AmbientSynthesizer {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  
  private isSynthesizing = false;
  private currentFreq = 136.1;
  private currentType: OscillatorType = "sine";
  private currentVol = 0.3;

  constructor() {
    // Lazy initialize when sound is played
  }

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn("Web Audio API not supported in this browser.");
      return;
    }
    this.ctx = new AudioContextClass();
  }

  public play(freq: number, type: OscillatorType = "sine", vol: number = 0.3) {
    this.init();
    if (!this.ctx) return;

    // Resume if suspended (browser behavior)
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    if (this.isSynthesizing) {
      this.stop();
    }

    this.currentFreq = freq;
    this.currentType = type;
    this.currentVol = vol;

    try {
      // Create oscillator and filter to create a warm, deep drone
      this.osc = this.ctx.createOscillator();
      this.osc.type = type;
      this.osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = "lowpass";
      // Cut off high frequencies for a deep ambient background feel
      this.filterNode.frequency.setValueAtTime(freq * 2.5, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(1.0, this.ctx.currentTime);

      this.gainNode = this.ctx.createGain();
      // Smooth fade-in
      this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 1.5);

      // Create a subtle low-frequency oscillator (LFO) for deep space phase modulation
      this.lfo = this.ctx.createOscillator();
      this.lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // very slow 0.12Hz cycle

      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(1.5, this.ctx.currentTime); // subtle pitch vibrato (1.5Hz deviation)

      // Connect LFO -> LFO Gain -> Oscillator frequency parameter (detune / vibrato)
      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.osc.frequency);

      // Connect main audio path: Osc -> Filter -> Gain -> Destination
      this.osc.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      // Start oscillators
      this.osc.start();
      this.lfo.start();
      this.isSynthesizing = true;
    } catch (err) {
      console.error("Failed to start synthesizer:", err);
    }
  }

  public setVolume(vol: number) {
    this.currentVol = vol;
    if (this.ctx && this.gainNode && this.isSynthesizing) {
      this.gainNode.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.2);
    }
  }

  public updateFrequency(freq: number) {
    this.currentFreq = freq;
    if (this.ctx && this.osc && this.isSynthesizing) {
      this.osc.frequency.exponentialRampToValueAtTime(freq, this.ctx.currentTime + 1.0);
      if (this.filterNode) {
        this.filterNode.frequency.exponentialRampToValueAtTime(freq * 2.5, this.ctx.currentTime + 1.2);
      }
    }
  }

  public stop() {
    if (!this.isSynthesizing) return;

    if (this.ctx && this.gainNode) {
      const scheduledTime = this.ctx.currentTime + 0.8;
      // Smooth fade-out to prevent audible pops
      this.gainNode.gain.linearRampToValueAtTime(0, scheduledTime);
      
      const currentOsc = this.osc;
      const currentLfo = this.lfo;
      
      setTimeout(() => {
        try {
          currentOsc?.stop();
          currentLfo?.stop();
        } catch (e) {
          // already stopped
        }
      }, 900);
    }

    this.osc = null;
    this.lfo = null;
    this.gainNode = null;
    this.filterNode = null;
    this.lfoGain = null;
    this.isSynthesizing = false;
  }

  public isPlaying(): boolean {
    return this.isSynthesizing;
  }
}

// Single instance to use across application
export const ambientSynth = new AmbientSynthesizer();
export default ambientSynth;
