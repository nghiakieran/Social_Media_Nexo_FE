import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
  MonitorUp,
  MonitorOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoPlayer } from "./VideoPlayer";
import type { CallState, ActiveCallInfo } from "../hooks/useCallWebRTC";
import type { CallNotificationDTO, ECallType } from "../types";

interface CallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  callState: CallState;
  activeCall: ActiveCallInfo | null;

  incomingCall: CallNotificationDTO | null;

  isMuted: boolean;
  isVideoOff: boolean;
  duration: number;

  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  localStreamRef?: React.RefObject<MediaStream | null>;
  remoteStreams?: Map<number, MediaStream>;

  onAccept: () => void;
  onDecline: () => void;
  onHangUp: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  
  isScreenSharing?: boolean;
  onToggleScreenShare?: () => void;
  screenShareSupported?: boolean;
  screenShareError?: string | null;
  onClearScreenShareError?: () => void;
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
  localStreamRef,
  remoteStreams,
  onAccept,
  onDecline,
  onHangUp,
  onToggleMute,
  onToggleVideo,
  isScreenSharing = false,
  onToggleScreenShare,
  screenShareSupported,
  screenShareError,
  onClearScreenShareError,
}) => {
  const callType = activeCall?.callType ?? incomingCall?.callType;
  const withVideo = isVideoCall(callType);

  const remoteVideoEl = remoteVideoRef as React.MutableRefObject<HTMLVideoElement | null>;
  const localVideoEl = localVideoRef as React.MutableRefObject<HTMLVideoElement | null>;

  const contactName =
    activeCall?.remoteUserName ?? 
    (incomingCall?.isGroupCall ? `Cuộc gọi nhóm từ ${incomingCall.callerFullName}` : incomingCall?.callerFullName) ?? "";
  const contactAvatar =
    activeCall?.remoteAvatarUrl ?? incomingCall?.callerAvatarUrl ?? "";

  const isIncoming = callState === "ringing" && !!incomingCall;
  const isConnected = callState === "connected";
  const isCalling = callState === "calling";
  const isEnded = callState === "ended";

  const statusRinging =
    isIncoming || isCalling ? "animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 border-0 p-0 shadow-2xl",
          "[&>button:last-of-type]:pointer-events-auto [&>button:last-of-type]:z-[110] [&>button:last-of-type]:inline-flex [&>button:last-of-type]:size-11 [&>button:last-of-type]:items-center [&>button:last-of-type]:justify-center [&>button:last-of-type]:rounded-full [&>button:last-of-type]:border-0 [&>button:last-of-type]:bg-white/15 [&>button:last-of-type]:p-0 [&>button:last-of-type]:text-white [&>button:last-of-type]:opacity-95 [&>button:last-of-type]:shadow-none [&>button:last-of-type]:backdrop-blur-md [&>button:last-of-type]:transition-colors hover:[&>button:last-of-type]:bg-white/25 hover:[&>button:last-of-type]:opacity-100 [&>button:last-of-type]:right-5 [&>button:last-of-type]:top-5 [&>button:last-of-type>svg]:size-5 focus-visible:[&>button:last-of-type]:ring-white/40",
          withVideo && isConnected
            ? "h-[min(85dvh,720px)] w-[min(96vw,920px)] max-w-none overflow-hidden sm:rounded-2xl bg-black"
            : withVideo
              ? "w-[min(94vw,560px)] max-w-none overflow-hidden rounded-2xl bg-black p-0 sm:rounded-2xl"
              : "w-[min(92vw,420px)] max-w-none overflow-hidden rounded-3xl bg-transparent p-0 sm:rounded-3xl"
        )}
      >
        <DialogTitle className="sr-only">
          {isIncoming ? `Cuộc gọi đến từ ${contactName}` : `Cuộc gọi ${contactName}`}
        </DialogTitle>

        {/* ─── Video call ─── */}
        {withVideo && (
          <div
            className={cn(
              "relative flex w-full flex-col bg-zinc-950",
              isConnected
                ? "h-full min-h-[min(85dvh,720px)]"
                : "min-h-[min(56dvh,420px)] sm:min-h-[min(50dvh,380px)]"
            )}
          >
            {/* Mesh UI: Grid rendering */}
            {remoteStreams && remoteStreams.size > 0 ? (
              <div
                className={cn(
                  "absolute inset-0 h-full w-full bg-zinc-950",
                  remoteStreams.size > 1 ? "grid gap-1 p-1" : "",
                  remoteStreams.size === 2 ? "grid-cols-2" : "",
                  remoteStreams.size === 3 || remoteStreams.size === 4 ? "grid-cols-2 grid-rows-2" : "",
                  remoteStreams.size > 4 ? "grid-cols-3 grid-rows-2" : ""
                )}
              >
                {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
                  <VideoPlayer key={userId} stream={stream} className="h-full w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <video
                ref={(el) => {
                  remoteVideoEl.current = el;
                }}
                autoPlay
                playsInline
                className="absolute inset-0 h-full w-full bg-zinc-950 object-cover"
              />
            )}

            {/* Local preview: avoid stacking on bottom dock while ringing / connecting */}
            <video
              ref={(el) => {
                localVideoEl.current = el;
                if (el && localStreamRef?.current && el.srcObject !== localStreamRef.current) {
                  el.srcObject = localStreamRef.current;
                }
              }}
              autoPlay
              playsInline
              muted
              className={cn(
                "absolute z-10 aspect-video overflow-hidden rounded-2xl border-2 border-white/35 object-cover shadow-2xl ring-1 ring-white/15",
                isConnected
                  ? "bottom-24 right-4 w-[28%] max-w-[200px]"
                  : "right-4 top-[4.25rem] w-[32%] max-w-[168px] sm:top-20 sm:max-w-[180px]",
                isVideoOff && "hidden"
              )}
            />

            {/* Connected: top bar only (timer + name) */}
            {isConnected && (
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center bg-gradient-to-b from-black/75 via-black/40 to-transparent pb-12 pt-4">
                <div className="pointer-events-auto flex flex-col items-center gap-0.5 px-4 text-center">
                  <p className="text-base font-semibold tracking-tight text-white drop-shadow-md sm:text-lg">
                    {contactName}
                  </p>
                  <p className="font-mono text-sm tabular-nums text-emerald-300">
                    {formatDuration(duration)}
                  </p>
                </div>
              </div>
            )}

            {/* Pre-connect / ended: single column — no duplicate name; clear space for dock */}
            {!isConnected && (
              <div className="pointer-events-none absolute inset-0 z-[15] flex flex-col bg-gradient-to-b from-black/50 via-black/70 to-black/90">
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-[8.5rem] pt-14 text-center">
                  <div className="relative mb-5 sm:mb-6">
                    <span
                      className={cn(
                        "absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl",
                        statusRinging
                      )}
                    />
                    <Avatar className="relative mx-auto h-[5.5rem] w-[5.5rem] border-[3px] border-white/25 shadow-2xl ring-2 ring-white/10 sm:h-32 sm:w-32">
                      <AvatarImage src={contactAvatar} alt="" className="object-cover" />
                      <AvatarFallback className="bg-white/10 text-2xl font-semibold text-white sm:text-3xl">
                        {contactName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="text-balance text-lg font-semibold text-zinc-50 drop-shadow-md sm:text-xl">
                    {contactName}
                  </p>
                  <div className="mt-3 max-w-[280px] space-y-1">
                    {isEnded && <p className="text-sm text-zinc-300">Cuộc gọi kết thúc</p>}
                    {!isEnded && isIncoming && (
                      <p className="text-sm font-medium text-zinc-200">Cuộc gọi video đến</p>
                    )}
                    {!isEnded && isCalling && (
                      <p className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-50">
                        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.55)]" />
                        Đang gọi…
                      </p>
                    )}
                    {!isEnded && !isIncoming && !isCalling && (
                      <p className="text-sm font-medium text-zinc-200">Đang kết nối…</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom control dock */}
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 z-30 flex flex-col justify-center bg-gradient-to-t from-black via-black/80 to-transparent px-6 pb-6 pt-16 sm:pb-8 sm:pt-20"
              )}
            >
              {isConnected && screenShareError && (
                <div className="bg-red-500/90 backdrop-blur-sm text-white text-sm px-4 py-2 flex items-center justify-between gap-3 mb-2 rounded-lg mx-4">
                  <span>{screenShareError}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {screenShareSupported !== false && (
                      <button
                        onClick={onToggleScreenShare}
                        className="text-white underline text-sm hover:no-underline"
                      >
                        Thử lại
                      </button>
                    )}
                    <button
                      onClick={onClearScreenShareError}
                      className="text-white/80 hover:text-white text-base leading-none"
                      aria-label="Đóng"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
                {isIncoming && (
                  <>
                    <Button
                      onClick={onDecline}
                      size="lg"
                      variant="destructive"
                      className="h-16 w-16 rounded-full p-0 shadow-lg shadow-red-900/40"
                      title="Từ chối"
                    >
                      <PhoneOff className="h-7 w-7" />
                    </Button>
                    <Button
                      onClick={onAccept}
                      size="lg"
                      className="h-16 w-16 rounded-full border-0 bg-emerald-500 p-0 shadow-lg shadow-emerald-900/40 hover:bg-emerald-600"
                      title="Chấp nhận"
                    >
                      <Video className="h-7 w-7 text-white" />
                    </Button>
                  </>
                )}

                {isCalling && (
                  <Button
                    onClick={onHangUp}
                    size="lg"
                    variant="destructive"
                    className="h-16 w-16 rounded-full p-0 shadow-lg"
                    title="Hủy cuộc gọi"
                  >
                    <PhoneOff className="h-7 w-7" />
                  </Button>
                )}

                {isConnected && (
                  <>
                    <Button
                      onClick={onToggleMute}
                      size="lg"
                      variant="secondary"
                      className={cn(
                        "h-14 w-14 rounded-full border-0 p-0 shadow-lg",
                        isMuted
                          ? "bg-rose-500/90 text-white hover:bg-rose-600"
                          : "bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                      )}
                      title={isMuted ? "Bật micro" : "Tắt micro"}
                    >
                      {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    </Button>

                    <Button
                      onClick={onToggleVideo}
                      size="lg"
                      variant="secondary"
                      className={cn(
                        "h-14 w-14 rounded-full border-0 p-0 shadow-lg",
                        isVideoOff
                          ? "bg-rose-500/90 text-white hover:bg-rose-600"
                          : "bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                      )}
                      title={isVideoOff ? "Bật camera" : "Tắt camera"}
                    >
                      {isVideoOff ? (
                        <VideoOff className="h-6 w-6" />
                      ) : (
                        <Video className="h-6 w-6" />
                      )}
                    </Button>

                    <Button
                      onClick={onToggleScreenShare}
                      size="lg"
                      variant="secondary"
                      disabled={screenShareSupported === false || !onToggleScreenShare}
                      className={cn(
                        "h-14 w-14 rounded-full border-0 p-0 shadow-lg",
                        isScreenSharing
                          ? "bg-sky-500/90 text-white hover:bg-sky-600"
                          : "bg-white/20 text-white backdrop-blur-md hover:bg-white/30",
                        (screenShareSupported === false) && "opacity-50 cursor-not-allowed"
                      )}
                      title={
                        screenShareSupported === false
                          ? "Chia sẻ màn hình không khả dụng"
                          : isScreenSharing
                            ? "Dừng chia sẻ màn hình"
                            : "Chia sẻ màn hình"
                      }
                    >
                      {isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <MonitorUp className="h-6 w-6" />}
                    </Button>

                    <Button
                      onClick={onHangUp}
                      size="lg"
                      variant="destructive"
                      className="h-16 w-16 rounded-full p-0 shadow-xl shadow-red-900/50"
                      title="Kết thúc"
                    >
                      <PhoneOff className="h-8 w-8" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Audio call */}
        {!withVideo && (
          <div className="relative flex min-h-[min(88dvh,580px)] w-full flex-col overflow-hidden rounded-3xl">
            {/* Hidden video element to play remote audio */}
            {remoteStreams && remoteStreams.size > 0 ? (
              <div className="hidden">
                {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
                  <VideoPlayer key={userId} stream={stream} />
                ))}
              </div>
            ) : (
              <video
                ref={(el) => {
                  remoteVideoEl.current = el;
                }}
                autoPlay
                playsInline
                className="hidden"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/90 to-slate-950" />
            {contactAvatar ? (
              <div className="absolute inset-0 opacity-35">
                <img
                  src={contactAvatar}
                  alt=""
                  className="h-full w-full scale-110 object-cover blur-3xl"
                  draggable={false}
                />
              </div>
            ) : null}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_35%,rgba(99,102,241,0.22),transparent_55%)]" />

            <div className="relative z-10 flex flex-1 flex-col items-center px-6 pb-36 pt-16 text-center">
              <div className="relative mb-7">
                {(isIncoming || isCalling) && (
                  <>
                    <span
                      className={cn(
                        "absolute -inset-3 rounded-full border border-emerald-400/35",
                        "animate-[ping_2.25s_cubic-bezier(0,0,0.2,1)_infinite]"
                      )}
                    />
                    <span
                      className={cn(
                        "absolute -inset-6 rounded-full border border-white/[0.08]",
                        "animate-[ping_2.25s_cubic-bezier(0,0,0.2,1)_infinite] [animation-delay:0.45s]"
                      )}
                    />
                    <span
                      className={cn(
                        "absolute -inset-9 rounded-full border border-white/[0.05]",
                        "animate-[ping_2.25s_cubic-bezier(0,0,0.2,1)_infinite] [animation-delay:0.9s]"
                      )}
                    />
                  </>
                )}
                <Avatar className="relative h-36 w-36 border-4 border-white/15 shadow-2xl ring-4 ring-black/20">
                  <AvatarImage src={contactAvatar} alt={contactName} className="object-cover" />
                  <AvatarFallback className="bg-white/10 text-4xl font-semibold text-white">
                    {contactName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-white drop-shadow-sm">
                {contactName}
              </h2>

              <div className="mt-4 min-h-[2.75rem]">
                {isIncoming && (
                  <p className="text-[15px] text-zinc-200/95">Cuộc gọi thoại đến</p>
                )}
                {isCalling && (
                  <p className="flex items-center justify-center gap-2.5 text-[15px] font-medium text-zinc-50 drop-shadow-sm">
                    <Circle className="h-2.5 w-2.5 shrink-0 fill-emerald-400 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.55)] animate-pulse" />
                    Đang gọi…
                  </p>
                )}
                {isConnected && (
                  <p className="font-mono text-3xl font-medium tabular-nums tracking-wide text-emerald-300 drop-shadow-md">
                    {formatDuration(duration)}
                  </p>
                )}
                {isEnded && <p className="text-zinc-300">Cuộc gọi kết thúc</p>}
              </div>

              {!isEnded && (
                <p className="mt-7 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-300">
                  <Phone className="h-3.5 w-3.5 text-sky-300/90" strokeWidth={2} />
                  Cuộc gọi thoại
                </p>
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center bg-gradient-to-t from-black/75 via-black/30 to-transparent px-6 pb-12 pt-20">
              <div className="flex items-center justify-center gap-6 sm:gap-10">
                {isIncoming && (
                  <>
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        onClick={onDecline}
                        size="lg"
                        variant="destructive"
                        className="h-16 w-16 rounded-full p-0 shadow-xl shadow-red-950/50"
                        title="Từ chối"
                      >
                        <PhoneOff className="h-7 w-7" />
                      </Button>
                      <span className="text-xs text-white/55">Từ chối</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        onClick={onAccept}
                        size="lg"
                        className="h-16 w-16 rounded-full border-0 bg-emerald-500 p-0 shadow-xl shadow-emerald-950/40 hover:bg-emerald-600"
                        title="Trả lời"
                      >
                        <Phone className="h-7 w-7 text-white" />
                      </Button>
                      <span className="text-xs text-white/55">Trả lời</span>
                    </div>
                  </>
                )}

                {isCalling && (
                  <Button
                    onClick={onHangUp}
                    size="lg"
                    variant="destructive"
                    className="h-[4.25rem] w-[4.25rem] rounded-full p-0 shadow-2xl shadow-red-950/45"
                    title="Hủy cuộc gọi"
                  >
                    <PhoneOff className="h-8 w-8" />
                  </Button>
                )}

                {isConnected && (
                  <>
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        onClick={onToggleMute}
                        size="lg"
                        variant="secondary"
                        className={cn(
                          "h-14 w-14 rounded-full border-0 p-0 shadow-lg",
                          isMuted
                            ? "bg-amber-500/95 text-white hover:bg-amber-600"
                            : "bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                        )}
                        title={isMuted ? "Bật micro" : "Tắt micro"}
                      >
                        {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                      </Button>
                      <span className="text-xs text-white/50">
                        {isMuted ? "Đã tắt mic" : "Micro"}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <Button
                        onClick={onHangUp}
                        size="lg"
                        variant="destructive"
                        className="h-[4.25rem] w-[4.25rem] rounded-full p-0 shadow-2xl shadow-red-950/60"
                        title="Kết thúc"
                      >
                        <PhoneOff className="h-8 w-8" />
                      </Button>
                      <span className="text-xs text-white/50">Kết thúc</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
