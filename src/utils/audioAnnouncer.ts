// Web Audio API Synthesizer Chime & Speech Synthesis Announcer
// 100% Client-Side with Zero External Dependencies

export function playChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First tone: C5 (523.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Second tone: G5 (783.99 Hz) - pleasant café pickup bell
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.18);
    gain2.gain.setValueAtTime(0.28, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.18);
    osc2.stop(now + 0.9);
  } catch (e) {
    console.warn('Audio Context Chime Warning:', e);
  }
}

export function speakOrderReady(orderNumber: string, customerName?: string) {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();

    // Format readable number (e.g. SF-2026-0004 -> "4")
    const cleanedNumber = orderNumber.replace(/SF-\d+-0*/, '') || orderNumber;

    const speechText = customerName && customerName !== 'Walk-in Customer'
      ? `Order number ${cleanedNumber} for ${customerName} is now ready for pickup.`
      : `Order number ${cleanedNumber} is now ready for pickup at the counter.`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) utterance.voice = naturalVoice;

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech Synthesis Warning:', e);
  }
}
