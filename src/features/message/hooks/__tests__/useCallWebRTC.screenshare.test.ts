import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  applyVideoTrackToAllPeers,
  applyAudioTrackToAllPeers,
} from "../../utils/screenShareUtils";

function makeMockTrack(kind: "video" | "audio"): MediaStreamTrack {
  return { kind, id: Math.random().toString() } as unknown as MediaStreamTrack;
}

function makeMockSender(kind: "video" | "audio") {
  const track = makeMockTrack(kind);
  return {
    track,
    replaceTrack: vi.fn(),
  };
}

function makeMockPeer(opts: { hasVideoSender?: boolean; hasAudioSender?: boolean } = {}) {
  const { hasVideoSender = true, hasAudioSender = true } = opts;
  const senders: Array<{ track: MediaStreamTrack; replaceTrack: ReturnType<typeof vi.fn> }> = [];
  let videoSender: ReturnType<typeof makeMockSender> | undefined;
  let audioSender: ReturnType<typeof makeMockSender> | undefined;

  if (hasVideoSender) {
    videoSender = makeMockSender("video");
    senders.push(videoSender);
  }
  if (hasAudioSender) {
    audioSender = makeMockSender("audio");
    senders.push(audioSender);
  }

  const pc = {
    getSenders: vi.fn(() => senders),
    videoSender,
    audioSender,
  } as unknown as RTCPeerConnection & {
    videoSender?: ReturnType<typeof makeMockSender>;
    audioSender?: ReturnType<typeof makeMockSender>;
  };

  return pc;
}

describe("applyVideoTrackToAllPeers", () => {
  it("calls replaceTrack on each video sender with the screen track and returns 2", () => {
    const screenVideoTrack = makeMockTrack("video");
    const peer1 = makeMockPeer();
    const peer2 = makeMockPeer();
    const peers = new Map<number, RTCPeerConnection>([
      [1, peer1 as unknown as RTCPeerConnection],
      [2, peer2 as unknown as RTCPeerConnection],
    ]);

    const result = applyVideoTrackToAllPeers(peers, screenVideoTrack);

    expect(result).toBe(2);
    expect((peer1 as ReturnType<typeof makeMockPeer>).videoSender!.replaceTrack).toHaveBeenCalledOnce();
    expect((peer1 as ReturnType<typeof makeMockPeer>).videoSender!.replaceTrack).toHaveBeenCalledWith(screenVideoTrack);
    expect((peer2 as ReturnType<typeof makeMockPeer>).videoSender!.replaceTrack).toHaveBeenCalledOnce();
    expect((peer2 as ReturnType<typeof makeMockPeer>).videoSender!.replaceTrack).toHaveBeenCalledWith(screenVideoTrack);
  });

  it("returns 0 and does not throw when peers map is empty", () => {
    const screenVideoTrack = makeMockTrack("video");
    const result = applyVideoTrackToAllPeers(new Map(), screenVideoTrack);
    expect(result).toBe(0);
  });
});

describe("applyAudioTrackToAllPeers", () => {
  it("calls replaceTrack on each audio sender with the audio track and returns 2", () => {
    const audioTrack = makeMockTrack("audio");
    const peer1 = makeMockPeer();
    const peer2 = makeMockPeer();
    const peers = new Map<number, RTCPeerConnection>([
      [1, peer1 as unknown as RTCPeerConnection],
      [2, peer2 as unknown as RTCPeerConnection],
    ]);

    const result = applyAudioTrackToAllPeers(peers, audioTrack);

    expect(result).toBe(2);
    expect((peer1 as ReturnType<typeof makeMockPeer>).audioSender!.replaceTrack).toHaveBeenCalledOnce();
    expect((peer1 as ReturnType<typeof makeMockPeer>).audioSender!.replaceTrack).toHaveBeenCalledWith(audioTrack);
    expect((peer2 as ReturnType<typeof makeMockPeer>).audioSender!.replaceTrack).toHaveBeenCalledOnce();
    expect((peer2 as ReturnType<typeof makeMockPeer>).audioSender!.replaceTrack).toHaveBeenCalledWith(audioTrack);
  });

  it("returns 0 and does not throw when peers map is empty", () => {
    const result = applyAudioTrackToAllPeers(new Map(), null);
    expect(result).toBe(0);
  });
});

describe("getDisplayMedia is called with audio: true", () => {
  beforeEach(() => {
    const fakeVideoTrack = makeMockTrack("video");
    const fakeAudioTrack = makeMockTrack("audio");
    const fakeStream = {
      getVideoTracks: () => [fakeVideoTrack],
      getAudioTracks: () => [fakeAudioTrack],
      getTracks: () => [fakeVideoTrack, fakeAudioTrack],
    } as unknown as MediaStream;

    Object.defineProperty(global.navigator, "mediaDevices", {
      value: {
        getDisplayMedia: vi.fn().mockResolvedValue(fakeStream),
        getUserMedia: vi.fn().mockResolvedValue(fakeStream),
      },
      writable: true,
      configurable: true,
    });
  });

  it("getDisplayMedia receives audio: true in constraints", async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith(
      expect.objectContaining({ audio: true })
    );
    expect(stream.getVideoTracks()).toHaveLength(1);
    expect(stream.getAudioTracks()).toHaveLength(1);
  });
});
