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
  { urls: "stun:stun2.l.google.com:19302" },
];

export type CallState = "idle" | "calling" | "ringing" | "connected" | "ended";

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
  onCallEnded?: (status: ECallStatus, durationSeconds: number | null) => void;
}

export function useCallWebRTC({ onCallEnded }: UseCallWebRTCOptions = {}) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [activeCall, setActiveCall] = useState<ActiveCallInfo | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallNotificationDTO | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs to hold latest values without causing effect re-runs
  const activeCallRef = useRef<ActiveCallInfo | null>(null);
  const callStateRef = useRef<CallState>("idle");
  const incomingCallRef = useRef<CallNotificationDTO | null>(null);
  const onCallEndedRef = useRef(onCallEnded);

  // Keep refs in sync
  useEffect(() => { activeCallRef.current = activeCall; }, [activeCall]);
  useEffect(() => { callStateRef.current = callState; }, [callState]);
  useEffect(() => { incomingCallRef.current = incomingCall; }, [incomingCall]);
  useEffect(() => { onCallEndedRef.current = onCallEnded; }, [onCallEnded]);

  const ws = getWebSocketService();

  // ─── Cleanup ────────────────────────────────────────────────────────────────

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
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
  }, []);

  // ─── Create RTCPeerConnection ────────────────────────────────────────────────

  const createPeerConnection = useCallback((callId: number) => {
    if (pcRef.current) {
      pcRef.current.close();
    }

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
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("[WebRTC] connection state:", pc.connectionState);
      if (pc.connectionState === "connected" && !durationIntervalRef.current) {
        setCallState("connected");
        callStateRef.current = "connected";
        durationIntervalRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      } else if (
        pc.connectionState === "failed" ||
        pc.connectionState === "disconnected"
      ) {
        console.warn("[WebRTC] connection lost:", pc.connectionState);
      }
    };

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pcRef.current = pc;
    return pc;
  }, [ws]);

  // ─── Get user media ──────────────────────────────────────────────────────────

  const getUserMedia = useCallback(async (isVideo: boolean) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: isVideo ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  }, []);

  // ─── Initiate outgoing call ──────────────────────────────────────────────────

  const startCall = useCallback(
    async (
      conversationId: number,
      callType: ECallType,
      remoteUser: { id: number; name: string; avatarUrl: string }
    ) => {
      console.log("[Call] startCall called, state=", callStateRef.current);
      if (callStateRef.current !== "idle") return;

      const isVideo = callType === "VIDEO_CALL";
      try {
        await getUserMedia(isVideo);
        setCallState("calling");
        callStateRef.current = "calling";

        const info: ActiveCallInfo = {
          callId: 0, // updated when BE confirms
          conversationId,
          callType,
          isIncoming: false,
          remoteUserId: remoteUser.id,
          remoteUserName: remoteUser.name,
          remoteAvatarUrl: remoteUser.avatarUrl,
        };
        setActiveCall(info);
        activeCallRef.current = info;

        ws.initiateCall({ conversationId, callType });
      } catch (err) {
        console.error("[WebRTC] getUserMedia failed:", err);
        cleanup();
        setCallState("idle");
        callStateRef.current = "idle";
      }
    },
    [getUserMedia, ws, cleanup]
  );

  // ─── Answer incoming call ────────────────────────────────────────────────────

  const answerCall = useCallback(async () => {
    const incoming = incomingCallRef.current;
    if (!incoming) return;

    const isVideo = incoming.callType === "VIDEO_CALL";
    try {
      await getUserMedia(isVideo);

      // Create PC before responding so we're ready for the OFFER
      createPeerConnection(incoming.callId);

      // Tell BE we accepted — BE will then tell caller to send OFFER
      ws.respondToCall({ callId: incoming.callId, accepted: true });

      const info: ActiveCallInfo = {
        callId: incoming.callId,
        conversationId: incoming.conversationId,
        callType: incoming.callType,
        isIncoming: true,
        remoteUserId: incoming.callerId,
        remoteUserName: incoming.callerFullName,
        remoteAvatarUrl: incoming.callerAvatarUrl,
        startedAt: incoming.startedAt,
      };
      setActiveCall(info);
      activeCallRef.current = info;
      setIncomingCall(null);
      incomingCallRef.current = null;
      // State will become "connected" via onconnectionstatechange
      setCallState("ringing"); // waiting for WebRTC to complete
      callStateRef.current = "ringing";
    } catch (err) {
      console.error("[WebRTC] answerCall failed:", err);
      cleanup();
      setCallState("idle");
      callStateRef.current = "idle";
      ws.respondToCall({ callId: incoming.callId, accepted: false });
      setIncomingCall(null);
      incomingCallRef.current = null;
    }
  }, [getUserMedia, createPeerConnection, ws, cleanup]);

  // ─── Reject ──────────────────────────────────────────────────────────────────

  const rejectCall = useCallback(() => {
    const incoming = incomingCallRef.current;
    if (!incoming) return;
    ws.respondToCall({ callId: incoming.callId, accepted: false });
    setIncomingCall(null);
    incomingCallRef.current = null;
    setCallState("idle");
    callStateRef.current = "idle";
  }, [ws]);

  // ─── Hang up ─────────────────────────────────────────────────────────────────

  const hangUp = useCallback(() => {
    const callId = activeCallRef.current?.callId;
    if (callId) {
      ws.endCall({ callId });
    }
    cleanup();
    setCallState("ended");
    callStateRef.current = "ended";
    setActiveCall(null);
    activeCallRef.current = null;
    setTimeout(() => {
      setCallState("idle");
      callStateRef.current = "idle";
    }, 1500);
  }, [ws, cleanup]);

  const dismissCall = useCallback(() => {
    const s = callStateRef.current;

    if (s === "idle") return;

    if (s === "connected") {
      hangUp();
      return;
    }

    if (s === "ended") {
      cleanup();
      setCallState("idle");
      callStateRef.current = "idle";
      setActiveCall(null);
      activeCallRef.current = null;
      return;
    }

    if (incomingCallRef.current) {
      const inc = incomingCallRef.current;
      ws.respondToCall({ callId: inc.callId, accepted: false });
      setIncomingCall(null);
      incomingCallRef.current = null;
      setCallState("idle");
      callStateRef.current = "idle";
      return;
    }

    const callId = activeCallRef.current?.callId;
    if (callId) {
      ws.endCall({ callId });
    }
    cleanup();
    setActiveCall(null);
    activeCallRef.current = null;
    setCallState("idle");
    callStateRef.current = "idle";
  }, [hangUp, ws, cleanup]);

  // ─── Toggle mute / video ─────────────────────────────────────────────────────

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    setIsMuted((prev) => {
      localStreamRef.current!.getAudioTracks().forEach((t) => { t.enabled = prev; });
      return !prev;
    });
  }, []);

  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return;
    setIsVideoOff((prev) => {
      localStreamRef.current!.getVideoTracks().forEach((t) => { t.enabled = prev; });
      return !prev;
    });
  }, []);

  // ─── WebSocket event handlers (stable refs — never recreated) ────────────────

  const handleIncomingCall = useCallback((notification: CallNotificationDTO) => {
    console.log("[Call] incoming:", notification);
    if (callStateRef.current === "idle") {
      setIncomingCall(notification);
      incomingCallRef.current = notification;
      setCallState("ringing");
      callStateRef.current = "ringing";
    }
  }, []); // no deps — reads callStateRef

  const handleCallResponse = useCallback(
    async (response: { callId: number; status: string }) => {
      console.log("[Call] response:", response);
      const call = activeCallRef.current;
      if (!call) return;

      if (response.status === "ACCEPTED") {
        // Update callId from BE (was 0 placeholder)
        const updatedCall = { ...call, callId: response.callId };
        setActiveCall(updatedCall);
        activeCallRef.current = updatedCall;

        // Caller creates PeerConnection and sends OFFER
        const pc = createPeerConnection(response.callId);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          ws.sendCallSignal({
            callId: response.callId,
            type: "OFFER",
            sdp: offer.sdp,
          });
          console.log("[WebRTC] OFFER sent, callId:", response.callId);
        } catch (err) {
          console.error("[WebRTC] createOffer failed:", err);
        }
      } else {
        cleanup();
        setCallState("ended");
        callStateRef.current = "ended";
        setActiveCall(null);
        activeCallRef.current = null;
        setTimeout(() => {
          setCallState("idle");
          callStateRef.current = "idle";
        }, 1500);
      }
    },
    [createPeerConnection, ws, cleanup] // no activeCall dep — reads activeCallRef
  );

  const handleCallSignal = useCallback(
    async (signal: CallSignalDTO) => {
      console.log("[WebRTC] signal:", signal.type, "callId:", signal.callId);
      const pc = pcRef.current;
      if (!pc) {
        console.warn("[WebRTC] no PeerConnection for signal:", signal.type);
        return;
      }

      try {
        if (signal.type === "OFFER" && signal.sdp) {
          await pc.setRemoteDescription({ type: "offer", sdp: signal.sdp });
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.sendCallSignal({
            callId: signal.callId,
            type: "ANSWER",
            sdp: answer.sdp,
          });
          console.log("[WebRTC] ANSWER sent");
        } else if (signal.type === "ANSWER" && signal.sdp) {
          await pc.setRemoteDescription({ type: "answer", sdp: signal.sdp });
          console.log("[WebRTC] remote description set (ANSWER)");
        } else if (signal.type === "ICE_CANDIDATE" && signal.candidate) {
          const candidate = JSON.parse(signal.candidate) as RTCIceCandidateInit;
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("[WebRTC] signal handling error:", err);
      }
    },
    [ws]
  );

  const handleCallEnded = useCallback((ended: CallEndedDTO) => {
    console.log("[Call] ended:", ended);
    onCallEndedRef.current?.(ended.finalStatus, ended.durationSeconds);
    cleanup();
    setCallState("ended");
    callStateRef.current = "ended";
    setActiveCall(null);
    activeCallRef.current = null;
    setIncomingCall(null);
    incomingCallRef.current = null;
    setTimeout(() => {
      setCallState("idle");
      callStateRef.current = "idle";
    }, 1500);
  }, [cleanup]); // no onCallEnded dep — reads onCallEndedRef

  // ─── Subscribe once on mount, never re-subscribe ────────────────────────────

  useEffect(() => {
    console.log("[Call] useCallWebRTC mounted, ws.isConnected()=", ws.isConnected());

    const subscribe = () => {
      ws.subscribeToCallEvents(
        handleIncomingCall,
        handleCallResponse,
        handleCallSignal,
        handleCallEnded
      );
      console.log("[Call] subscribed to call events");
    };

    if (ws.isConnected()) {
      subscribe();
    } else {
      console.log("[Call] WS not connected yet, waiting...");
      ws.addConnectedListener(subscribe);
    }

    return () => {
      console.log("[Call] useCallWebRTC unmounted");
      ws.removeConnectedListener(subscribe);
      ws.unsubscribeFromCallEvents();
    };
  }, []); // intentionally empty — handlers are stable via refs

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
    startCall,
    answerCall,
    rejectCall,
    hangUp,
    dismissCall,
    toggleMute,
    toggleVideo,
    resubscribeCallEvents: () => {
      ws.subscribeToCallEvents(
        handleIncomingCall,
        handleCallResponse,
        handleCallSignal,
        handleCallEnded
      );
    },
  };
}
