import { useRef, useState, useCallback, useEffect } from "react";
import { getWebSocketService } from "../services/websocketService";
import { startRingtone, stopRingtone, startRingbackTone, stopRingbackTone } from "@/utils/inAppAlertSounds";
import type {
  CallNotificationDTO,
  CallSignalDTO,
  CallEndedDTO,
  ECallType,
  ECallStatus,
} from "../types";

const TURN_SERVER_URL = import.meta.env.VITE_TURN_SERVER_URL ?? "turn:nexosocial.id.vn:3478";
const TURN_USERNAME = import.meta.env.VITE_TURN_USERNAME ?? "nexo";
const TURN_CREDENTIAL = import.meta.env.VITE_TURN_CREDENTIAL ?? "nexo@turn123";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  {
    urls: TURN_SERVER_URL,
    username: TURN_USERNAME,
    credential: TURN_CREDENTIAL,
  },
];

export type CallState = "idle" | "calling" | "ringing" | "connected" | "ended";

export interface ActiveCallInfo {
  callId: number;
  conversationId: number;
  callType: ECallType;
  isIncoming: boolean;
  remoteUserId: number; // Tạm giữ for compat, nhưng ở mesh sẽ có nhiều remote users
  remoteUserName: string;
  remoteAvatarUrl: string;
  startedAt?: string;
  isGroupCall?: boolean;
}

interface UseCallWebRTCOptions {
  myUserId?: number;
  onCallEnded?: (status: ECallStatus, durationSeconds: number | null, conversationId?: number) => void;
}

export function useCallWebRTC({ myUserId, onCallEnded }: UseCallWebRTCOptions = {}) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [activeCall, setActiveCall] = useState<ActiveCallInfo | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallNotificationDTO | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);

  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Mesh Topology states
  const peersRef = useRef<Map<number, RTCPeerConnection>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Map<number, MediaStream>>(new Map());

  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  
  // Vẫn giữ remoteVideoRef để code cũ không lỗi ngay lập tức, 
  // nhưng Mesh UI nên dùng remoteStreams.
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs to hold latest values without causing effect re-runs
  const activeCallRef = useRef<ActiveCallInfo | null>(null);
  const callStateRef = useRef<CallState>("idle");
  const incomingCallRef = useRef<CallNotificationDTO | null>(null);
  const onCallEndedRef = useRef(onCallEnded);
  const myUserIdRef = useRef(myUserId);

  // Keep refs in sync
  useEffect(() => { activeCallRef.current = activeCall; }, [activeCall]);
  useEffect(() => { callStateRef.current = callState; }, [callState]);
  useEffect(() => { incomingCallRef.current = incomingCall; }, [incomingCall]);
  useEffect(() => { onCallEndedRef.current = onCallEnded; }, [onCallEnded]);
  useEffect(() => { myUserIdRef.current = myUserId; }, [myUserId]);

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
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    
    // Close all PeerConnections
    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();
    setRemoteStreams(new Map());

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
    stopRingtone();
    stopRingbackTone();
  }, []);

  // ─── Create RTCPeerConnection for a specific user ─────────────────────────────

  const createPeerConnection = useCallback((callId: number, targetUserId: number) => {
    const existingPc = peersRef.current.get(targetUserId);
    if (existingPc) {
      existingPc.close();
    }

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws.sendCallSignal({
          callId,
          targetUserId,
          type: "ICE_CANDIDATE",
          candidate: JSON.stringify(event.candidate),
        });
      }
    };

    pc.ontrack = (event) => {
      // Compatibility with old 1-1 UI
      if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      
      // Update Mesh streams state
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        next.set(targetUserId, event.streams[0]);
        return next;
      });
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] connection state for peer ${targetUserId}:`, pc.connectionState);
      if (pc.connectionState === "connected") {
        if (callStateRef.current !== "connected") {
          setCallState("connected");
          callStateRef.current = "connected";
          stopRingbackTone();
          if (!durationIntervalRef.current) {
            durationIntervalRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
          }
        }
      } else if (
        pc.connectionState === "failed" ||
        pc.connectionState === "disconnected"
      ) {
        console.warn(`[WebRTC] connection lost for peer ${targetUserId}:`, pc.connectionState);
        setRemoteStreams((prev) => {
          const next = new Map(prev);
          next.delete(targetUserId);
          return next;
        });
        peersRef.current.delete(targetUserId);
        pc.close();
      }
    };

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    peersRef.current.set(targetUserId, pc);
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
      remoteUser: { id: number; name: string; avatarUrl: string; isGroupCall?: boolean }
    ) => {
      console.log("[Call] startCall called, state=", callStateRef.current);
      if (callStateRef.current !== "idle") return;

      const isVideo = callType === "VIDEO_CALL";
      try {
        await getUserMedia(isVideo);
        setCallState("calling");
        callStateRef.current = "calling";
        startRingbackTone();

        const info: ActiveCallInfo = {
          callId: 0, // updated when BE confirms
          conversationId,
          callType,
          isIncoming: false,
          remoteUserId: remoteUser.id,
          remoteUserName: remoteUser.name,
          remoteAvatarUrl: remoteUser.avatarUrl,
          isGroupCall: remoteUser.isGroupCall,
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

    stopRingtone();
    const isVideo = incoming.callType === "VIDEO_CALL";
    try {
      await getUserMedia(isVideo);

      // Tell BE we accepted — BE will then tell caller to send OFFER
      ws.respondToCall({ callId: incoming.callId, accepted: true });

      const info: ActiveCallInfo = {
        callId: incoming.callId,
        conversationId: incoming.conversationId,
        callType: incoming.callType,
        isIncoming: true,
        remoteUserId: incoming.callerId,
        remoteUserName: incoming.isGroupCall ? `Cuộc gọi nhóm từ ${incoming.callerFullName}` : incoming.callerFullName,
        remoteAvatarUrl: incoming.callerAvatarUrl,
        startedAt: incoming.startedAt,
        isGroupCall: incoming.isGroupCall,
      };
      setActiveCall(info);
      activeCallRef.current = info;
      setIncomingCall(null);
      incomingCallRef.current = null;
      // State will become "connected" via onconnectionstatechange
      setCallState("ringing"); 
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
  }, [getUserMedia, ws, cleanup]);

  // ─── Reject ──────────────────────────────────────────────────────────────────

  const rejectCall = useCallback(() => {
    const incoming = incomingCallRef.current;
    if (!incoming) return;
    stopRingtone();
    ws.respondToCall({ callId: incoming.callId, accepted: false });
    cleanup();
    setCallState("idle");
    callStateRef.current = "idle";
    setTimeout(() => {
      setIncomingCall(null);
      incomingCallRef.current = null;
    }, 500);
  }, [ws, cleanup]);

  // ─── Hang up ─────────────────────────────────────────────────────────────────

  const hangUp = useCallback(() => {
    const callId = activeCallRef.current?.callId;
    if (callId) {
      ws.endCall({ callId });
    }
    cleanup();
    setCallState("ended");
    callStateRef.current = "ended";
    setTimeout(() => {
      setCallState("idle");
      callStateRef.current = "idle";
      setActiveCall(null);
      activeCallRef.current = null;
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
      setTimeout(() => {
        setActiveCall(null);
        activeCallRef.current = null;
      }, 500);
      return;
    }

    if (incomingCallRef.current) {
      const inc = incomingCallRef.current;
      ws.respondToCall({ callId: inc.callId, accepted: false });
      setIncomingCall(null);
      setCallState("idle");
      callStateRef.current = "idle";
      setTimeout(() => {
        setIncomingCall(null);
        incomingCallRef.current = null;
      }, 500);
      return;
    }

    const callId = activeCallRef.current?.callId;
    if (callId) {
      ws.endCall({ callId });
    }
    cleanup();
    setCallState("ended");
    callStateRef.current = "ended";
    setTimeout(() => {
      setCallState("idle");
      callStateRef.current = "idle";
      setActiveCall(null);
      activeCallRef.current = null;
    }, 1500);
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

  const toggleScreenShare = useCallback(async () => {
    try {
      if (isScreenSharing) {
        // Stop screen share
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((t) => t.stop());
          screenStreamRef.current = null;
        }

        // Revert to local camera stream
        const localVideoTrack = localStreamRef.current?.getVideoTracks()[0];
        if (localVideoTrack) {
          peersRef.current.forEach((pc) => {
            const sender = pc.getSenders().find((s) => s.track?.kind === "video");
            if (sender) {
              sender.replaceTrack(localVideoTrack);
            }
          });
          if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
        }
        setIsScreenSharing(false);
      } else {
        // Start screen share
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        
        const screenTrack = screenStream.getVideoTracks()[0];
        
        // Handle stop sharing from browser UI
        screenTrack.onended = () => {
          if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((t) => t.stop());
            screenStreamRef.current = null;
          }
          const localVideoTrack = localStreamRef.current?.getVideoTracks()[0];
          if (localVideoTrack) {
            peersRef.current.forEach((pc) => {
              const sender = pc.getSenders().find((s) => s.track?.kind === "video");
              if (sender) {
                sender.replaceTrack(localVideoTrack);
              }
            });
            if (localVideoRef.current && localStreamRef.current) {
              localVideoRef.current.srcObject = localStreamRef.current;
            }
          }
          setIsScreenSharing(false);
        };

        // Replace track on all PeerConnections
        peersRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        // Show screen share on local preview
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
      }
    } catch (err) {
      console.error("[WebRTC] Error toggling screen share:", err);
    }
  }, [isScreenSharing]);

  // ─── WebSocket event handlers (stable refs — never recreated) ────────────────

  const handleCallInitiated = useCallback((notification: CallNotificationDTO) => {
    console.log("[Call] initiated confirmed, callId=", notification.callId);
    const call = activeCallRef.current;
    if (call && call.callId === 0) {
      const updated = { ...call, callId: notification.callId };
      setActiveCall(updated);
      activeCallRef.current = updated;
    }
  }, []); 

  const handleIncomingCall = useCallback((notification: CallNotificationDTO) => {
    console.log("[Call] incoming:", notification);
    if (callStateRef.current === "idle") {
      setIncomingCall(notification);
      incomingCallRef.current = notification;
      setCallState("ringing");
      callStateRef.current = "ringing";
      startRingtone();
    }
  }, []); 

  const handleCallResponse = useCallback(
    async (response: { callId: number; status: string; responderId: number }) => {
      console.log("[Call] response:", response);
      const call = activeCallRef.current;
      if (!call) return;

      if (response.status === "ACCEPTED") {
        stopRingbackTone();
        // Update callId from BE (was 0 placeholder)
        if (call.callId === 0) {
          const updatedCall = { ...call, callId: response.callId };
          setActiveCall(updatedCall);
          activeCallRef.current = updatedCall;
        }

        const myId = myUserIdRef.current;
        if (myId && response.responderId !== myId) {
          // Responder accepted, so we create a PC to connect to them and send OFFER
          const pc = createPeerConnection(response.callId, response.responderId);
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            ws.sendCallSignal({
              callId: response.callId,
              targetUserId: response.responderId,
              type: "OFFER",
              sdp: offer.sdp,
            });
            console.log("[WebRTC] OFFER sent to", response.responderId);
          } catch (err) {
            console.error("[WebRTC] createOffer failed:", err);
          }
        }
      } else {
        cleanup();
        setCallState("ended");
        callStateRef.current = "ended";
        setTimeout(() => {
          setCallState("idle");
          callStateRef.current = "idle";
          setActiveCall(null);
          activeCallRef.current = null;
        }, 1500);
      }
    },
    [createPeerConnection, ws, cleanup]
  );

  const handleCallSignal = useCallback(
    async (signal: CallSignalDTO) => {
      console.log("[WebRTC] signal:", signal.type, "from:", signal.senderId, "to:", signal.targetUserId);
      const myId = myUserIdRef.current;
      
      // Nếu tín hiệu không dành cho mình thì bỏ qua
      if (signal.targetUserId && myId && signal.targetUserId !== myId) {
        return;
      }

      let pc = peersRef.current.get(signal.senderId);

      // Nếu nhận được OFFER mà chưa có PC thì tạo mới
      if (!pc && signal.type === "OFFER") {
        pc = createPeerConnection(signal.callId, signal.senderId);
      }

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
            targetUserId: signal.senderId,
            type: "ANSWER",
            sdp: answer.sdp,
          });
          console.log("[WebRTC] ANSWER sent to", signal.senderId);
        } else if (signal.type === "ANSWER" && signal.sdp) {
          await pc.setRemoteDescription({ type: "answer", sdp: signal.sdp });
          console.log("[WebRTC] remote description set (ANSWER) from", signal.senderId);
        } else if (signal.type === "ICE_CANDIDATE" && signal.candidate) {
          const candidate = JSON.parse(signal.candidate) as RTCIceCandidateInit;
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("[WebRTC] signal handling error:", err);
      }
    },
    [createPeerConnection, ws]
  );

  const handleCallEnded = useCallback((ended: CallEndedDTO) => {
    console.log("[Call] ended:", ended);
    stopRingtone();
    stopRingbackTone();
    const convId = activeCallRef.current?.conversationId || incomingCallRef.current?.conversationId;
    onCallEndedRef.current?.(ended.finalStatus, ended.durationSeconds, convId);
    cleanup();
    setCallState("ended");
    callStateRef.current = "ended";
    setTimeout(() => {
      setCallState("idle");
      callStateRef.current = "idle";
      setActiveCall(null);
      activeCallRef.current = null;
      setIncomingCall(null);
      incomingCallRef.current = null;
    }, 1500);
  }, [cleanup]);

  // ─── Subscribe once on mount, never re-subscribe ────────────────────────────

  useEffect(() => {
    console.log("[Call] useCallWebRTC mounted, ws.isConnected()=", ws.isConnected());

    const subscribe = () => {
      ws.subscribeToCallEvents(
        handleIncomingCall,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleCallResponse as any,
        handleCallSignal,
        handleCallEnded,
        handleCallInitiated
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
  }, []); 

  // Helpers cho mesh feature: late join & ping
  const pingCall = useCallback((targetUserId: number) => {
    const callId = activeCallRef.current?.callId;
    if (callId) {
      ws.pingCall({ callId, type: "OFFER", targetUserId });
    }
  }, [ws]);

  const joinCall = useCallback((callId: number) => {
    ws.joinCall({ callId, type: "OFFER" });
  }, [ws]);

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
    remoteStreams,
    startCall,
    answerCall,
    rejectCall,
    hangUp,
    dismissCall,
    toggleMute,
    toggleVideo,
    isScreenSharing,
    toggleScreenShare,
    pingCall,
    joinCall,
    resubscribeCallEvents: () => {
      ws.subscribeToCallEvents(
        handleIncomingCall,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleCallResponse as any,
        handleCallSignal,
        handleCallEnded,
        handleCallInitiated
      );
    },
  };
}