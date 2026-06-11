/**
 * Âm báo tin nhắn đến trong tab.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC =
      window.AudioContext ||
      (
        window as unknown as {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;
    if (!AC) return null;
    audioCtx ??= new AC();
    return audioCtx;
  } catch {
    return null;
  }
}

function playTone(
  frequencyHz: number,
  durationMs: number,
  peakGain = 0.14,
): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    if (ctx.state === "suspended") void ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequencyHz;
    osc.connect(gain);
    gain.connect(ctx.destination);

    const t0 = ctx.currentTime;
    const dur = durationMs / 1000;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peakGain, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur + 0.02);

    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  } catch {
    /* autoplay policy / disposed context */
  }
}

/** Một nốt ngắn — tin nhắn đến */
export function playMessageAlertSound(): void {
  playTone(523, 85, 0.13);
}

let ringtoneInterval: ReturnType<typeof setInterval> | null = null;

function playRingPattern(): void {
  playTone(880, 400, 0.2);
  setTimeout(() => playTone(660, 400, 0.2), 450);
}

export function startRingtone(): void {
  if (ringtoneInterval) return;
  playRingPattern();
  ringtoneInterval = setInterval(playRingPattern, 1800);
}

export function stopRingtone(): void {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
}

let ringbackInterval: ReturnType<typeof setInterval> | null = null;

function playRingbackPattern(): void {
  // Standard ringback tone (e.g. 440Hz for 1.2s, then pause)
  playTone(440, 1200, 0.1);
}

export function startRingbackTone(): void {
  if (ringbackInterval) return;
  playRingbackPattern();
  ringbackInterval = setInterval(playRingbackPattern, 4000); // repeat every 4 seconds
}

export function stopRingbackTone(): void {
  if (ringbackInterval) {
    clearInterval(ringbackInterval);
    ringbackInterval = null;
  }
}

const recentChatSoundByMessageId = new Map<number, number>();
const CHAT_SOUND_DEDUP_MS = 1200;

/** Chỉ báo khi người gửi không phải mình; dedup theo messageId nhiều subscriber cùng cuộc. */
export function playIncomingChatAlertIfNeeded(
  messageId: number,
  senderId: number,
  currentUserId: number | undefined,
): void {
  if (currentUserId == null || senderId === currentUserId) return;

  const now = Date.now();
  const last = recentChatSoundByMessageId.get(messageId);
  if (last !== undefined && now - last < CHAT_SOUND_DEDUP_MS) return;

  recentChatSoundByMessageId.set(messageId, now);
  if (recentChatSoundByMessageId.size > 80) {
    for (const [id, t] of recentChatSoundByMessageId) {
      if (now - t > 60_000) recentChatSoundByMessageId.delete(id);
    }
  }

  playMessageAlertSound();
}
