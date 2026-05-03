import { useRef, useState, useCallback, useEffect } from "react";
import { getWebSocketService } from "../services/websocketService";
import type {
  CallNotificationDTO,
  CallSignalDTO,
  CallEndedDTO,
  ECallType,
  ECallStatus,
} from "../types";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export type CallState =
  | "idle"
  | "calling"
  | "ringing"
  | "connected"
  | "ended";

export interface ActiveCallInfo {
  callId: number;
  conversationId: number;
  callType: ECallType;
  isIncoming: boolean;
  remoteUserId: number;
  remoteUserName: string;
  remoteAvatarUrl: string;
  startedAt?: string;
}

interface UseCallWebRTCOptions {
  conversationId?: number;
  onCallEnded?: (status: ECallStatus, durationSeconds: number | null) => void;
}

export function useCallWebRTC({ onCallEnded }: UseCallWebRTCOptions = {}) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [activeCall, setActiveCall] = useState<ActiveCallInfo | null>(null);
  const [incomingCall, setIncomingCall] =
    useState<CallNotificationDTO | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const isCreatingOfferRef = useRef(false);

  const ws = getWebSocketService();

  // ─── Cleanup ───────────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    remoteStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
  }, []);

  // ─── Create RTCPeerConnection ───────────────────────────────────────────────

  const createPeerConnection = useCallback(
    (callId: number, isVideo: boolean) => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          ws.sendCallSignal({
            callId,
            type: "ICE_CANDIDATE",
            candidate: JSON.stringify(event.candidate),
          });
        }
      };

      pc.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "connected" &&
          !durationIntervalRef.current
        ) {
          setCallState("connected");
          durationIntervalRef.current = setInterval(
            () => setDuration((d) => d + 1),
            1000
          );
        }
      };

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      pcRef.current = pc;
      return pc;
    },
    [ws]
  );

  // ─── Get user media ────────────────────────────────────────────────────────

  const getUserMedia = useCallback(async (isVideo: boolean) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: isVideo
        ? { width: { ideal: 1280 }, height: { ideal: 720 } }
        : false,
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  }, []);

  // ─── Initiate outgoing call ────────────────────────────────────────────────

  const startCall = useCallback(
    async (
      conversationId: number,
      callType: ECallType,
      remoteUser: { id: number; name: string; avatarUrl: string }
    ) => {
      if (callState !== "idle") return;

      const isVideo = callType === "VIDEO_CALL";
      try {
        await getUserMedia(isVideo);
        setCallState("calling");

        ws.initiateCall({ conversationId, callType });

        // activeCall will be set when backend echoes back the callId via response
        setActiveCall({
          callId: 0, // placeholder, will be updated on response
          conversationId,
          callType,
          isIncoming: false,
          remoteUserId: remoteUser.id,
          remoteUserName: remoteUser.name,
          remoteAvatarUrl: remoteUser.avatarUrl,
        });
      } catch {
        cleanup();
        setCallState("idle");
      }
    },
    [callState, getUserMedia, ws, cleanup]
  );

  // ─── Answer incoming call ──────────────────────────────────────────────────

  const answerCall = useCallback(async () => {
    if (!incomingCall) return;

    const isVideo = incomingCall.callType === "VIDEO_CALL";
    try {
      await getUserMedia(isVideo);

      const pc = createPeerConnection(incomingCall.callId, isVideo);
      setCallState("connected");

      ws.respondToCall({ callId: incomingCall.callId, accepted: true });

      setActiveCall({
        callId: incomingCall.callId,
        conversationId: incomingCall.conversationId,
        callType: incomingCall.callType,
        isIncoming: true,
        remoteUserId: incomingCall.callerId,
        remoteUserName: incomingCall.callerFullName,
        remoteAvatarUrl: incomingCall.callerAvatarUrl,
        startedAt: incomingCall.startedAt,
      });
      setIncomingCall(null);

      durationIntervalRef.current = setInterval(
        () => setDuration((d) => d + 1),
        1000
      );
    } catch {
      cleanup();
      setCallState("idle");
      ws.respondToCall({ callId: incomingCall.callId, accepted: false });
      setIncomingCall(null);
    }
  }, [incomingCall, getUserMedia, createPeerConnection, ws, cleanup]);

  // ─── Reject / Decline ─────────────────────────────────────────────────────

  const rejectCall = useCallback(() => {
    if (!incomingCall) return;
    ws.respondToCall({ callId: incomingCall.callId, accepted: false });
    setIncomingCall(null);
    setCallState("idle");
  }, [incomingCall, ws]);

  // ─── Hang up ───────────────────────────────────────────────────────────────

  const hangUp = useCallback(() => {
    const callId = activeCall?.callId;
    if (callId) {
      ws.endCall({ callId });
    }
    cleanup();
    setCallState("ended");
    setActiveCall(null);
    setTimeout(() => setCallState("idle"), 1500);
  }, [activeCall, ws, cleanup]);

  // ─── Toggle mute ──────────────────────────────────────────────────────────

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = isMuted;
    });
    setIsMuted((prev) => !prev);
  }, [isMuted]);

  // ─── Toggle video ─────────────────────────────────────────────────────────

  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((t) => {
      t.enabled = isVideoOff;
    });
    setIsVideoOff((prev) => !prev);
  }, [isVideoOff]);

  // ─── Handle incoming WebSocket call events ─────────────────────────────────

  const handleIncomingCall = useCallback((notification: CallNotificationDTO) => {
    if (callState === "idle") {
      setIncomingCall(notification);
      setCallState("ringing");
    }
  }, [callState]);

  const handleCallResponse = useCallback(
    async (response: { callId: number; status: string }) => {
      if (!activeCall) return;

      if (response.status === "ACCEPTED") {
        const isVideo = activeCall.callType === "VIDEO_CALL";
        const pc = createPeerConnection(activeCall.callId, isVideo);

        // Caller creates the offer
        if (!isCreatingOfferRef.current) {
          isCreatingOfferRef.current = true;
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            ws.sendCallSignal({
              callId: activeCall.callId,
              type: "OFFER",
              sdp: offer.sdp,
            });
          } finally {
            isCreatingOfferRef.current = false;
          }
        }

        setActiveCall((prev) => prev ? { ...prev, callId: response.callId } : prev);
        setCallState("connected");
        durationIntervalRef.current = setInterval(
          () => setDuration((d) => d + 1),
          1000
        );
      } else {
        // Rejected / busy
        cleanup();
        setCallState("ended");
        setActiveCall(null);
        setTimeout(() => setCallState("idle"), 1500);
      }
    },
    [activeCall, createPeerConnection, ws, cleanup]
  );

  const handleCallSignal = useCallback(
    async (signal: CallSignalDTO) => {
      const pc = pcRef.current;
      if (!pc) return;

      if (signal.type === "OFFER" && signal.sdp) {
        await pc.setRemoteDescription({ type: "offer", sdp: signal.sdp });
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.sendCallSignal({
          callId: signal.callId,
          type: "ANSWER",
          sdp: answer.sdp,
        });
      } else if (signal.type === "ANSWER" && signal.sdp) {
        await pc.setRemoteDescription({ type: "answer", sdp: signal.sdp });
      } else if (signal.type === "ICE_CANDIDATE" && signal.candidate) {
        try {
          const candidate = JSON.parse(signal.candidate) as RTCIceCandidateInit;
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch {
          // ignore stale candidates
        }
      }
    },
    [ws]
  );

  const handleCallEnded = useCallback(
    (ended: CallEndedDTO) => {
      onCallEnded?.(ended.finalStatus, ended.durationSeconds);
      cleanup();
      setCallState("ended");
      setActiveCall(null);
      setIncomingCall(null);
      setTimeout(() => setCallState("idle"), 1500);
    },
    [cleanup, onCallEnded]
  );

  // ─── Subscribe on mount ────────────────────────────────────────────────────

  useEffect(() => {
    if (!ws.isConnected()) return;

    ws.subscribeToCallEvents(
      handleIncomingCall,
      handleCallResponse,
      handleCallSignal,
      handleCallEnded
    );

    return () => {
      ws.unsubscribeFromCallEvents();
    };
  }, [ws, handleIncomingCall, handleCallResponse, handleCallSignal, handleCallEnded]);

  // ─── Re-subscribe when connection changes ─────────────────────────────────

  const resubscribeCallEvents = useCallback(() => {
    ws.subscribeToCallEvents(
      handleIncomingCall,
      handleCallResponse,
      handleCallSignal,
      handleCallEnded
    );
  }, [ws, handleIncomingCall, handleCallResponse, handleCallSignal, handleCallEnded]);

  return {
    callState,
    activeCall,
    incomingCall,
    isMuted,
    isVideoOff,
    duration,
    localVideoRef,
    remoteVideoRef,
    localStreamRef,
    remoteStreamRef,
    startCall,
    answerCall,
    rejectCall,
    hangUp,
    toggleMute,
    toggleVideo,
    resubscribeCallEvents,
  };
}
