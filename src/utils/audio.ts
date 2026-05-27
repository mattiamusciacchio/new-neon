/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class CyberSynth {
  private ctx: AudioContext | null = null;
  private backgroundDrone: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  private isHumPlaying: boolean = false;
  private masterVolume: number = 0.5;

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    this.masterVolume = volume;
    if (this.humGain) {
      this.humGain.gain.setValueAtTime(volume * 0.08, this.ctx?.currentTime || 0);
    }
  }

  public playBeep(freq: number = 800, duration: number = 0.1, type: OscillatorType = "sine") {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12 * this.masterVolume, this.ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context failed to play beep", e);
    }
  }

  public playClick() {
    this.playBeep(1200, 0.06, "triangle");
  }

  public playMenuClick() {
    this.playBeep(1800, 0.05, "sine");
  }

  public playUnlock() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Synthesize a double rising cyber chirp
      this.playBeep(1000, 0.08, "sine");
      setTimeout(() => {
        this.playBeep(1500, 0.15, "sine");
      }, 80);
    } catch {}
  }

  public playGlitch() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Distorted scan wave
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.4);

      filter.type = "peaking";
      filter.frequency.setValueAtTime(1000, now);
      filter.Q.setValueAtTime(15, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15 * this.masterVolume, now + 0.05);
      // glitch noise modulated by random timeouts
      gain.gain.linearRampToValueAtTime(0.08 * this.masterVolume, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 0.5);
    } catch {}
  }

  public playClueDiscovered() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.frequency.setValueAtTime(659.25, now); // E5
      osc2.frequency.setValueAtTime(987.77, now + 0.08); // B5

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12 * this.masterVolume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(now + 0.61);
      osc2.stop(now + 0.61);
    } catch {}
  }

  public startNeonHum() {
    if (this.isHumPlaying) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Sub hum oscillator (55Hz and 110Hz harmonics)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      this.humGain = this.ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(55, now); // A1 hum

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(110, now); // A2 higher hum

      this.humGain.gain.setValueAtTime(this.masterVolume * 0.08, now);

      osc1.connect(this.humGain);
      osc2.connect(this.humGain);
      this.humGain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();

      this.backgroundDrone = osc1; // reference for stopping
      this.isHumPlaying = true;
    } catch (e) {
      console.warn("Could not start hum", e);
    }
  }

  public toggleAmbient() {
    if (this.isHumPlaying) {
      try {
        if (this.backgroundDrone) {
          this.backgroundDrone.stop();
        }
      } catch {}
      this.isHumPlaying = false;
    } else {
      this.startNeonHum();
    }
  }
}

export const soundEngine = new CyberSynth();
