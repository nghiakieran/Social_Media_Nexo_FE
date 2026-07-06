/**
 * screenShareUtils.ts
 *
 * Pure helper functions for screen sharing track management.
 * No React imports, no side-effects — purely functional logic for WebRTC track operations.
 */

/**
 * Checks whether the browser supports the Screen Capture API.
 *
 * @returns true if `navigator.mediaDevices.getDisplayMedia` is available, false otherwise.
 */
export function isScreenCaptureSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getDisplayMedia
  );
}

/**
 * Replaces (or removes) the video track on the Video_Sender of EVERY RTCPeerConnection.
 *
 * For each peer, finds the first sender whose current track kind is "video" and
 * calls `sender.replaceTrack(track)`. Passing `null` removes the video track from
 * the outgoing stream without closing the sender.
 *
 * @param peers - Map of userId → RTCPeerConnection representing all active peers.
 * @param track - The new MediaStreamTrack to send, or null to remove the video track.
 * @returns The number of peers that had a video sender and were updated.
 */
export function applyVideoTrackToAllPeers(
  peers: Map<number, RTCPeerConnection>,
  track: MediaStreamTrack | null
): number {
  let applied = 0;

  peers.forEach((pc) => {
    const sender = pc.getSenders().find((s) => s.track?.kind === "video");
    if (sender) {
      sender.replaceTrack(track);
      applied++;
    }
  });

  return applied;
}

/**
 * Replaces (or removes) the audio track on the audio sender of EVERY RTCPeerConnection.
 *
 * For each peer, finds the first sender whose current track kind is "audio" and
 * calls `sender.replaceTrack(track)`. Used both when starting screen share (to send
 * system audio) and when stopping (to restore the microphone track).
 *
 * When `track` is null (e.g. camera audio is unavailable after stopping screen share),
 * every audio sender ends up with no input track — satisfying Requirement 7.4.
 *
 * @param peers - Map of userId → RTCPeerConnection representing all active peers.
 * @param track - The new MediaStreamTrack to send, or null to remove the audio track.
 * @returns The number of peers that had an audio sender and were updated.
 */
export function applyAudioTrackToAllPeers(
  peers: Map<number, RTCPeerConnection>,
  track: MediaStreamTrack | null
): number {
  let applied = 0;

  peers.forEach((pc) => {
    const sender = pc.getSenders().find((s) => s.track?.kind === "audio");
    if (sender) {
      sender.replaceTrack(track);
      applied++;
    }
  });

  return applied;
}

/**
 * Selects the correct outgoing video track for a newly created PeerConnection,
 * taking the current screen-sharing state into account (late-join support).
 *
 * Returns the screen video track when:
 *   - `isScreenSharing` is true, AND
 *   - `screenStream` is non-null and has at least one video track.
 *
 * Falls back to the first camera video track (or null if none exists) in all
 * other cases — including when the caller is not sharing, or when the screen
 * stream has no video tracks.
 *
 * @param args.isScreenSharing  - Whether the local user is currently sharing their screen.
 * @param args.screenStream     - The active Display_Stream, or null if not sharing.
 * @param args.cameraStream     - The local Camera_Stream, or null if unavailable.
 * @returns The MediaStreamTrack to add to the new PeerConnection, or null.
 */
export function selectOutgoingVideoTrack(args: {
  isScreenSharing: boolean;
  screenStream: MediaStream | null;
  cameraStream: MediaStream | null;
}): MediaStreamTrack | null {
  const { isScreenSharing, screenStream, cameraStream } = args;

  if (isScreenSharing && screenStream) {
    const screenVideoTracks = screenStream.getVideoTracks();
    if (screenVideoTracks.length > 0) {
      return screenVideoTracks[0];
    }
  }

  return cameraStream?.getVideoTracks()[0] ?? null;
}
