import React, { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CallState, ActiveCallInfo } from "../hooks/useCallWebRTC";
import type { CallNotificationDTO, ECallType } from "../types";

interface CallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // outgoing call
  callState: CallState;
  activeCall: ActiveCallInfo | null;

  // incoming call
  incomingCall: CallNotificationDTO | null;

  isMuted: boolean;
  isVideoOff: boolean;
  duration: number;

  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;

  onAccept: () => void;
  onDecline: () => void;
  onHangUp: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function isVideoCall(callType: ECallType | undefined) {
  return callType === "VIDEO_CALL";
}

export const CallDialog: React.FC<CallDialogProps> = ({
  open,
  onOpenChange,
  callState,
  activeCall,
  incomingCall,
  isMuted,
  isVideoOff,
  duration,
  localVideoRef,
  remoteVideoRef,
  onAccept,
  onDecline,
  onHangUp,
  onToggleMute,
  onToggleVideo,
}) => {
  const callType = activeCall?.callType ?? incomingCall?.callType;
  const withVideo = isVideoCall(callType);

  const remoteVideoEl = remoteVideoRef as React.MutableRefObject<HTMLVideoElement | null>;
  const localVideoEl = localVideoRef as React.MutableRefObject<HTMLVideoElement | null>;

  // contact info from whichever is active
  const contactName =
    activeCall?.remoteUserName ?? incomingCall?.callerFullName ?? "";
  const contactAvatar =
    activeCall?.remoteAvatarUrl ?? incomingCall?.callerAvatarUrl ?? "";

  const isIncoming = callState === "ringing" && !!incomingCall;
  const isConnected = callState === "connected";
  const isCalling = callState === "calling";
  const isEnded = callState === "ended";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "p-0 overflow-hidden",
          withVideo && isConnected
            ? "sm:max-w-2xl bg-black"
            : "sm:max-w-md bg-gradient-to-b from-background to-muted"
        )}
      >
        {/* Video streams */}
        {withVideo && (
          <div className="relative w-full aspect-video bg-black">
            {/* Remote video (full size) */}
            <video
              ref={(el) => { remoteVideoEl.current = el; }}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Local video (PiP bottom-right) */}
            <video
              ref={(el) => { localVideoEl.current = el; }}
              autoPlay
              playsInline
              muted
              className={cn(
                "absolute bottom-4 right-4 w-28 h-20 object-cover rounded-lg border border-white/20 shadow-lg",
                isVideoOff && "hidden"
              )}
            />

            {/* Overlay when no remote stream yet */}
            {!isConnected && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                <Avatar className="h-20 w-20 mb-4 border-2 border-white/30">
                  <AvatarImage src={contactAvatar} alt={contactName} />
                  <AvatarFallback className="text-2xl text-white bg-white/20">
                    {contactName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-white text-lg font-semibold">{contactName}</p>
                <p className="text-white/70 text-sm mt-1">
                  {isIncoming ? "Cuộc gọi video đến..." : "Đang kết nối..."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Audio call layout */}
        {!withVideo && (
          <div className="p-8 text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={contactAvatar} alt={contactName} />
              <AvatarFallback className="text-2xl">
                {contactName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{contactName}</h2>

            <div className="mt-4 mb-6 text-lg">
              {isIncoming && (
                <p className="text-muted-foreground">Cuộc gọi thoại đến...</p>
              )}
              {isCalling && (
                <p className="text-muted-foreground flex items-center justify-center gap-2">
                  <Circle className="h-3 w-3 fill-green-500 text-green-500 animate-pulse" />
                  Đang gọi...
                </p>
              )}
              {isConnected && (
                <p className="font-mono text-primary">{formatDuration(duration)}</p>
              )}
              {isEnded && (
                <p className="text-muted-foreground">Cuộc gọi kết thúc</p>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div
          className={cn(
            "flex justify-center gap-4 pb-8",
            withVideo && "absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm pt-4"
          )}
        >
          {/* Incoming call: accept + decline */}
          {isIncoming && (
            <>
              <Button
                onClick={onDecline}
                size="lg"
                variant="destructive"
                className="rounded-full h-14 w-14 p-0"
                title="Từ chối"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
              <Button
                onClick={onAccept}
                size="lg"
                className="rounded-full h-14 w-14 p-0 bg-green-500 hover:bg-green-600"
                title="Chấp nhận"
              >
                <Phone className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Outgoing ringing: cancel */}
          {isCalling && (
            <Button
              onClick={onHangUp}
              size="lg"
              variant="destructive"
              className="rounded-full h-14 w-14 p-0"
              title="Hủy"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          )}

          {/* Connected: mute, video toggle, hang up */}
          {isConnected && (
            <>
              <Button
                onClick={onToggleMute}
                size="lg"
                variant={isMuted ? "destructive" : "secondary"}
                className={cn(
                  "rounded-full h-12 w-12 p-0",
                  withVideo && "bg-white/20 hover:bg-white/30 text-white border-0"
                )}
                title={isMuted ? "Bật micro" : "Tắt micro"}
              >
                {isMuted ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>

              {withVideo && (
                <Button
                  onClick={onToggleVideo}
                  size="lg"
                  variant={isVideoOff ? "destructive" : "secondary"}
                  className={cn(
                    "rounded-full h-12 w-12 p-0",
                    isVideoOff ? "" : "bg-white/20 hover:bg-white/30 text-white border-0"
                  )}
                  title={isVideoOff ? "Bật camera" : "Tắt camera"}
                >
                  {isVideoOff ? (
                    <VideoOff className="h-5 w-5" />
                  ) : (
                    <Video className="h-5 w-5" />
                  )}
                </Button>
              )}

              <Button
                onClick={onHangUp}
                size="lg"
                variant="destructive"
                className="rounded-full h-12 w-12 p-0"
                title="Kết thúc cuộc gọi"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {/* Call type badge (audio only layout) */}
        {!withVideo && !isEnded && (
          <div className="flex justify-center pb-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">
              <Phone className="h-4 w-4 mr-2" />
              Cuộc gọi thoại
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
