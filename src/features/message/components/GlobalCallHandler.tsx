import React, { useEffect, useState } from "react";
import { useCallWebRTC } from "../hooks/useCallWebRTC";
import { CallDialog } from "./CallDialog";
import { CallContextProvider } from "../contexts/CallContext";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchMessages, fetchConversations } from "../messageSlice";

export const GlobalCallHandler: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const dispatch = useAppDispatch();
  const myUserId = useAppSelector((state) => state.auth.user?.id);

  useEffect(() => {
    console.log("[GlobalCallHandler] mounted");
    return () => console.log("[GlobalCallHandler] unmounted");
  }, []);

  const {
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
  } = useCallWebRTC({
    myUserId,
    onCallEnded: (status, duration, conversationId) => {
      if (conversationId) {
        setTimeout(() => {
          dispatch(fetchMessages({ conversationId, page: 1, size: 20 }));
          dispatch(fetchConversations({ page: 0, size: 20 }));
        }, 500);
      }
    },
  });

  useEffect(() => {
    setCallDialogOpen(callState !== "idle");
  }, [callState]);

  return (
    <CallContextProvider value={{ startCall }}>
      {children}
      <CallDialog
        open={callDialogOpen}
        onOpenChange={(open) => {
          if (!open) dismissCall();
          setCallDialogOpen(open);
        }}
        callState={callState}
        activeCall={activeCall}
        incomingCall={incomingCall}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        duration={duration}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        localStreamRef={localStreamRef}
        remoteStreams={remoteStreams}
        onAccept={answerCall}
        onDecline={rejectCall}
        onHangUp={hangUp}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        isScreenSharing={isScreenSharing}
        onToggleScreenShare={toggleScreenShare}
      />
    </CallContextProvider>
  );
};
