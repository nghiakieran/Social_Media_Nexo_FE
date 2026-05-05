import React, { useEffect, useState } from "react";
import { useCallWebRTC } from "../hooks/useCallWebRTC";
import { CallDialog } from "./CallDialog";
import { CallContextProvider } from "../contexts/CallContext";

export const GlobalCallHandler: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [callDialogOpen, setCallDialogOpen] = useState(false);

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
    startCall,
    answerCall,
    rejectCall,
    hangUp,
    dismissCall,
    toggleMute,
    toggleVideo,
  } = useCallWebRTC();

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
        onAccept={answerCall}
        onDecline={rejectCall}
        onHangUp={hangUp}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
      />
    </CallContextProvider>
  );
};
