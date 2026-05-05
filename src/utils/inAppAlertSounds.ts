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
