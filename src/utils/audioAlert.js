// Generates an audible chime notification using the browser's Web Audio API
// No external mp3 files needed!
export const playOrderChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + startTime + duration
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // 3 pleasant ascending chimes (like Blinkit / Swiggy merchant order alert)
    playTone(587.33, 0.0, 0.25); // D5
    playTone(739.99, 0.2, 0.25); // F#5
    playTone(880.0, 0.4, 0.45);  // A5
  } catch (err) {
    console.warn("Audio chime playback blocked or not supported:", err);
  }
};
