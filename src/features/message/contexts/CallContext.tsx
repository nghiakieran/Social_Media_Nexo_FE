import React, { createContext, useContext } from "react";
import type { ECallType } from "../types";

interface CallContextValue {
  startCall: (
    conversationId: number,
    callType: ECallType,
    remoteUser: { id: number; name: string; avatarUrl: string }
  ) => Promise<void>;
}

const CallContext = createContext<CallContextValue | null>(null);

export const useCallContext = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCallContext must be used inside GlobalCallHandler");
  return ctx;
};

export const CallContextProvider = CallContext.Provider;
