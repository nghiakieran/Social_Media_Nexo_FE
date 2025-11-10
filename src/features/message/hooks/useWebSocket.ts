import { useEffect, useRef, useCallback, useState } from "react";
import {
  getWebSocketService,
  WebSocketService,
} from "../services/websocketService";
import { EMessageType } from "../types";
import type {
  MessageDTO,
  TypingNotificationDTO,
  ReadReceiptDTO,
  ReadAllDTO,
  WebSocketErrorResponse,
  SendMessageRequest,
  PresenceStatusDTO,
} from "../types";

interface UseWebSocketOptions {
  onMessage?: (message: MessageDTO) => void;
  onTyping?: (notification: TypingNotificationDTO) => void;
  onReadReceipt?: (receipt: ReadReceiptDTO) => void;
  onReadAll?: (receipt: ReadAllDTO) => void;
  onError?: (error: WebSocketErrorResponse) => void;
  onPresence?: (presence: PresenceStatusDTO) => void;
  autoConnect?: boolean;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    onMessage,
    onTyping,
    onReadReceipt,
    onReadAll,
    onError,
    onPresence,
    autoConnect = true,
  } = options;

  const wsRef = useRef<WebSocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const subscribedConversations = useRef<Set<number>>(new Set());

  
  const connect = useCallback(() => {
    if (wsRef.current?.isConnected()) {
      return;
    }

    setIsConnecting(true);
    const ws = getWebSocketService();
    wsRef.current = ws;

    ws.connect(
      () => {
        setIsConnected(true);
        setIsConnecting(false);
      },
      () => {
        setIsConnected(false);
        setIsConnecting(false);
      },
      (error) => {
                setIsConnecting(false);
      }
    );
  }, []);

  
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
      setIsConnected(false);
      subscribedConversations.current.clear();
    }
  }, []);

  
  const subscribeToConversation = useCallback(
    (conversationId: number) => {
      if (!wsRef.current?.isConnected()) {
                return;
      }

      if (subscribedConversations.current.has(conversationId)) {
        return; // Already subscribed
      }

      wsRef.current.subscribeToConversation(
        conversationId,
        (message) => onMessage?.(message),
        (notification) => onTyping?.(notification),
        (receipt) => onReadReceipt?.(receipt),
        (receipt) => onReadAll?.(receipt)
      );

      subscribedConversations.current.add(conversationId);
    },
    [onMessage, onTyping, onReadReceipt, onReadAll]
  );

  
  const unsubscribeFromConversation = useCallback((conversationId: number) => {
    if (wsRef.current && subscribedConversations.current.has(conversationId)) {
      wsRef.current.unsubscribeFromConversation(conversationId);
      subscribedConversations.current.delete(conversationId);
    }
  }, []);

  
  const subscribeToPresence = useCallback(() => {
    if (!wsRef.current?.isConnected() || !onPresence) {
      return;
    }

    wsRef.current.subscribeToPresence(onPresence);
  }, [onPresence]);

  
  const unsubscribeFromPresence = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.unsubscribeFromPresence();
    }
  }, []);

  
  const subscribeToErrors = useCallback(
    (username?: string) => {
      if (!wsRef.current?.isConnected() || !onError) {
        return;
      }

      wsRef.current.subscribeToErrors(onError, username);
    },
    [onError]
  );

  
  const sendMessage = useCallback(
    (
      conversationId: number,
      content: string,
      messageType: EMessageType = EMessageType.TEXT,
      replyToMessageId?: number
    ) => {
      if (!wsRef.current?.isConnected()) {
        throw new Error("WebSocket not connected");
      }

      const request: SendMessageRequest = {
        conversationId,
        content,
        messageType,
        replyToMessageId: replyToMessageId || null,
      };

      wsRef.current.sendMessage(request);
    },
    []
  );

  
  const sendTyping = useCallback((conversationId: number) => {
    if (wsRef.current?.isConnected()) {
      wsRef.current.sendTyping(conversationId);
    }
  }, []);

  
  const markMessageAsRead = useCallback(
    (messageId: number, conversationId: number) => {
      if (wsRef.current?.isConnected()) {
        wsRef.current.markMessageAsRead(messageId, conversationId);
      }
    },
    []
  );

  
  const markConversationAsRead = useCallback((conversationId: number) => {
    if (wsRef.current?.isConnected()) {
      wsRef.current.markConversationAsRead(conversationId);
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  useEffect(() => {
    if (isConnected && onPresence) {
      subscribeToPresence();
    }
  }, [isConnected, onPresence, subscribeToPresence]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    subscribeToConversation,
    unsubscribeFromConversation,
    subscribeToPresence,
    unsubscribeFromPresence,
    subscribeToErrors,
    sendMessage,
    sendTyping,
    markMessageAsRead,
    markConversationAsRead,
  };
};
