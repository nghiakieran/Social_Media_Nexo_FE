import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type {
  SendMessageRequest,
  MessageDTO,
  TypingNotificationDTO,
  ReadMessageRequest,
  ReadConversationRequest,
  ReadReceiptDTO,
  ReadAllDTO,
  WebSocketErrorResponse,
  PresenceStatusDTO,
  ReactionUpdateDTO,
  ReactMessageRequest,
  EReactionType,
  CallNotificationDTO,
  CallResponseDTO,
  CallSignalDTO,
  CallEndedDTO,
  CallInitiateRequest,
  CallResponseRequest,
  CallSignalRequest,
  CallEndRequest,
} from "../types";
import { ACCESS_TOKEN_STORAGE_KEY } from "@/utils/constants";

type MessageCallback = (message: MessageDTO) => void;
type TypingCallback = (notification: TypingNotificationDTO) => void;
type ReadReceiptCallback = (receipt: ReadReceiptDTO) => void;
type ReadAllCallback = (receipt: ReadAllDTO) => void;
type ReactionUpdateCallback = (update: ReactionUpdateDTO) => void;
type ErrorCallback = (error: WebSocketErrorResponse) => void;
type PresenceCallback = (presence: PresenceStatusDTO) => void;

export class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  private onConnectedCallback?: () => void;
  private onDisconnectedCallback?: () => void;
  private onErrorCallback?: (error: unknown) => void;
  private connectedListeners: Set<() => void> = new Set();

  constructor(
    private baseUrl: string = import.meta.env.VITE_WS_URL ||
      "http://localhost:8080"
  ) {}

  
  connect(
    onConnected?: () => void,
    onDisconnected?: () => void,
    onError?: (error: unknown) => void
  ) {
    this.onConnectedCallback = onConnected;
    this.onDisconnectedCallback = onDisconnected;
    this.onErrorCallback = onError;

    const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

    if (!token) {
      this.onErrorCallback?.({ message: "Authentication required" });
      return;
    }

    this.client = new Client({
      webSocketFactory: () =>
        new SockJS(`${this.baseUrl}/messaging/ws`) as WebSocket,

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        this.reconnectAttempts = 0;
        this.onConnectedCallback?.();
        this.connectedListeners.forEach((cb) => cb());
      },

      onDisconnect: () => {
        this.onDisconnectedCallback?.();
      },

      onStompError: (frame) => {
        this.onErrorCallback?.(frame);
      },

      onWebSocketError: (event) => {
        this.onErrorCallback?.(event);
      },
    });

    this.client.activate();
  }

  addConnectedListener(cb: () => void) {
    this.connectedListeners.add(cb);
  }

  removeConnectedListener(cb: () => void) {
    this.connectedListeners.delete(cb);
  }


  disconnect() {
    if (this.client?.active) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();

      this.client.deactivate();
      this.client = null;
    }
  }

  
  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  
  subscribeToConversation(
    conversationId: number,
    onMessage: MessageCallback,
    onTyping: TypingCallback,
    onReadReceipt: ReadReceiptCallback,
    onReadAll: ReadAllCallback,
    onReactionUpdate?: ReactionUpdateCallback
  ) {
    if (!this.client?.connected) {
      return;
    }

    const baseTopic = `/topic/conversation/${conversationId}`;

    const messageSub = this.client.subscribe(baseTopic, (message: IMessage) => {
      const data: MessageDTO = JSON.parse(message.body);
      onMessage(data);
    });
    this.subscriptions.set(`${baseTopic}:message`, messageSub);

    const typingSub = this.client.subscribe(
      `${baseTopic}/typing`,
      (message: IMessage) => {
        const data: TypingNotificationDTO = JSON.parse(message.body);
        onTyping(data);
      }
    );
    this.subscriptions.set(`${baseTopic}:typing`, typingSub);

    const readSub = this.client.subscribe(
      `${baseTopic}/read`,
      (message: IMessage) => {
        const data: ReadReceiptDTO = JSON.parse(message.body);
        onReadReceipt(data);
      }
    );
    this.subscriptions.set(`${baseTopic}:read`, readSub);

    const readAllSub = this.client.subscribe(
      `${baseTopic}/read-all`,
      (message: IMessage) => {
        const data: ReadAllDTO = JSON.parse(message.body);
        onReadAll(data);
      }
    );
    this.subscriptions.set(`${baseTopic}:read-all`, readAllSub);

    if (onReactionUpdate) {
      const reactionSub = this.client.subscribe(
        `${baseTopic}/reactions`,
        (message: IMessage) => {
          const data: ReactionUpdateDTO = JSON.parse(message.body);
          onReactionUpdate(data);
        }
      );
      this.subscriptions.set(`${baseTopic}:reactions`, reactionSub);
    }
  }

  
  unsubscribeFromConversation(conversationId: number) {
    const baseTopic = `/topic/conversation/${conversationId}`;

    ["message", "typing", "read", "read-all", "reactions"].forEach((type) => {
      const key = `${baseTopic}:${type}`;
      const sub = this.subscriptions.get(key);
      if (sub) {
        sub.unsubscribe();
        this.subscriptions.delete(key);
      }
    });
  }

  
  subscribeToPresence(onPresence: PresenceCallback) {
    if (!this.client?.connected) {
      return;
    }

    const presenceSub = this.client.subscribe(
      "/user/queue/presence",
      (message: IMessage) => {
        const data: PresenceStatusDTO = JSON.parse(message.body);
        onPresence(data);
      }
    );
    this.subscriptions.set("user-presence", presenceSub);
  }

  unsubscribeFromPresence() {
    const sub = this.subscriptions.get("user-presence");
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete("user-presence");
    }
  }

  subscribeToErrors(onError: ErrorCallback, username?: string) {
    if (!this.client?.connected) {
      return;
    }

    if (username) {
      const userErrorSub = this.client.subscribe(
        `/user/${username}/queue/errors`,
        (message: IMessage) => {
          const error: WebSocketErrorResponse = JSON.parse(message.body);
          onError(error);
        }
      );
      this.subscriptions.set(`user-errors:${username}`, userErrorSub);
    }

    const globalErrorSub = this.client.subscribe(
      "/topic/errors",
      (message: IMessage) => {
        const error: WebSocketErrorResponse = JSON.parse(message.body);
        onError(error);
      }
    );
    this.subscriptions.set("global-errors", globalErrorSub);
  }

  
  sendMessage(request: SendMessageRequest) {
    if (!this.client?.connected) {
      throw new Error("WebSocket not connected");
    }

    this.client.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(request),
    });
  }

  
  sendTyping(conversationId: number) {
    if (!this.client?.connected) {
      return;
    }

    const notification: TypingNotificationDTO = {
      conversationId,
    };

    this.client.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify(notification),
    });
  }

  markMessageAsRead(messageId: number, conversationId: number) {
    if (!this.client?.connected) {
      return;
    }

    const request: ReadMessageRequest = {
      messageId,
      conversationId,
    };

    this.client.publish({
      destination: "/app/chat.read",
      body: JSON.stringify(request),
    });
  }

  markConversationAsRead(conversationId: number) {
    if (!this.client?.connected) {
      return;
    }

    const request: ReadConversationRequest = {
      conversationId,
    };

    this.client.publish({
      destination: "/app/chat.read-conversation",
      body: JSON.stringify(request),
    });
  }

  // Send reaction via WebSocket
  sendReaction(messageId: number, reactionType: EReactionType) {
    if (!this.client?.connected) {
      throw new Error("WebSocket not connected");
    }

    const request: ReactMessageRequest = {
      reactionType,
    };

    this.client.publish({
      destination: `/app/chat.react`,
      body: JSON.stringify({
        messageId,
        ...request,
      }),
    });
  }

  // Remove reaction via WebSocket
  sendRemoveReaction(messageId: number, reactionType: EReactionType) {
    if (!this.client?.connected) {
      throw new Error("WebSocket not connected");
    }

    this.client.publish({
      destination: `/app/chat.remove-reaction`,
      body: JSON.stringify({
        messageId,
        reactionType,
      }),
    });
  }

  // ─── Call signaling ────────────────────────────────────────────────────────

  subscribeToCallEvents(
    onIncomingCall: (notification: CallNotificationDTO) => void,
    onCallResponse: (response: CallResponseDTO) => void,
    onCallSignal: (signal: CallSignalDTO) => void,
    onCallEnded: (ended: CallEndedDTO) => void
  ) {
    if (!this.client?.connected) return;

    const incomingSub = this.client.subscribe(
      "/user/queue/call/incoming",
      (msg: IMessage) => onIncomingCall(JSON.parse(msg.body))
    );
    this.subscriptions.set("call:incoming", incomingSub);

    const responseSub = this.client.subscribe(
      "/user/queue/call/response",
      (msg: IMessage) => onCallResponse(JSON.parse(msg.body))
    );
    this.subscriptions.set("call:response", responseSub);

    const signalSub = this.client.subscribe(
      "/user/queue/call/signal",
      (msg: IMessage) => onCallSignal(JSON.parse(msg.body))
    );
    this.subscriptions.set("call:signal", signalSub);

    const endedSub = this.client.subscribe(
      "/user/queue/call/ended",
      (msg: IMessage) => onCallEnded(JSON.parse(msg.body))
    );
    this.subscriptions.set("call:ended", endedSub);
  }

  unsubscribeFromCallEvents() {
    ["call:incoming", "call:response", "call:signal", "call:ended"].forEach(
      (key) => {
        const sub = this.subscriptions.get(key);
        if (sub) {
          sub.unsubscribe();
          this.subscriptions.delete(key);
        }
      }
    );
  }

  initiateCall(request: CallInitiateRequest) {
    if (!this.client?.connected) throw new Error("WebSocket not connected");
    this.client.publish({
      destination: "/app/call.initiate",
      body: JSON.stringify(request),
    });
  }

  respondToCall(request: CallResponseRequest) {
    if (!this.client?.connected) throw new Error("WebSocket not connected");
    this.client.publish({
      destination: "/app/call.response",
      body: JSON.stringify(request),
    });
  }

  sendCallSignal(request: CallSignalRequest) {
    if (!this.client?.connected) throw new Error("WebSocket not connected");
    this.client.publish({
      destination: "/app/call.signal",
      body: JSON.stringify(request),
    });
  }

  endCall(request: CallEndRequest) {
    if (!this.client?.connected) throw new Error("WebSocket not connected");
    this.client.publish({
      destination: "/app/call.end",
      body: JSON.stringify(request),
    });
  }
}

let wsService: WebSocketService | null = null;

export const getWebSocketService = () => {
  if (!wsService) {
    wsService = new WebSocketService();
  }
  return wsService;
};

export const resetWebSocketService = () => {
  if (wsService) {
    wsService.disconnect();
    wsService = null;
  }
};
