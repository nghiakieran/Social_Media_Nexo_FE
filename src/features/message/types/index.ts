export enum EMessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  FILE = "FILE",
}

export enum EReactionType {
  LIKE = "LIKE",
  LOVE = "LOVE",
  HAHA = "HAHA",
  WOW = "WOW",
  SAD = "SAD",
  ANGRY = "ANGRY",
}

export enum EConversationStatus {
  NORMAL = "NORMAL",
  PENDING = "PENDING",
  BLOCKED = "BLOCKED",
  DECLINED = "DECLINED",
}

export interface UserDTO {
  id: number;
  username: string;
  nickname?: string;
  avatarUrl: string;
  fullName: string;
  onlineStatus?: boolean;
}

export interface ReactionDTO {
  id?: number;
  userId: number;
  username: string;
  reactionType: EReactionType;
  createdAt?: string;
}

export interface ReactionDetailDTO {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  avatarUrl: string;
  reactionType: EReactionType;
  createdAt: string;
}

export interface MediaDTO {
  id: number;
  mediaUrl: string;
  mediaType: EMessageType;
  filename?: string;
  size?: number;
}

export interface MessageDTO {
  id: number;
  conversationId: number;
  sender: UserDTO;
  content: string;
  messageType: EMessageType;
  status: string;
  replyToMessageId?: number | null;
  replyToMessage?: MessageDTO | null;
  mediaList: MediaDTO[];
  reactions: ReactionDTO[];
  isEdited?: boolean | null;
  editedAt?: string | null;
  createdAt: string;
}

export interface ConversationResponseDTO {
  id: number;
  fullname: string;
  avatarUrl: string;
  participants: UserDTO[];
  lastMessage: MessageDTO | null;
  unreadCount: number;
  lastMessageAt: string;
  createdAt: string;
  status: EConversationStatus;
  blockedByMe: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
  lastReadMessageId?: number;
  senderUserId?: number;
}

export interface SendMessageRequest {
  conversationId: number;
  content: string;
  messageType: EMessageType;
  replyToMessageId?: number | null;
  mediaUrls?: string[] | null;
}

export interface ReactMessageRequest {
  reactionType: EReactionType;
}

// Aggregated reaction from backend (real-time format)
export interface AggregatedReactionDTO {
  reactionType: EReactionType;
  count: number;
  userIds: number[];
}

// ReactionUpdateDTO from backend (real-time format)
export interface ReactionUpdateDTO {
  messageId: number;
  reactions: AggregatedReactionDTO[];
}

// Legacy format (for backward compatibility)
export interface ReactionUpdateLegacyDTO {
  messageId: number;
  conversationId: number;
  reaction: ReactionDTO;
  action: "ADD" | "REMOVE";
}

export interface TypingNotificationDTO {
  conversationId: number;
  userId?: number;
  username?: string;
  timestamp?: string;
}

export interface ReadMessageRequest {
  messageId: number;
  conversationId: number;
}

export interface ReadConversationRequest {
  conversationId: number;
}

export interface ReadReceiptDTO {
  messageId: number;
  userId: number;
  username: string;
}

export interface ReadAllDTO {
  conversationId: number;
  userId: number;
  lastReadMessageId: number; // Message ID cuối cùng đã đọc
  username?: string;
  timestamp?: string;
}

export interface WebSocketErrorResponse {
  error: string;
  message: string;
  timestamp: string;
}

export interface ResponseData<T = unknown> {
  status: number;
  message: string;
  data: T;
}

export interface PageModelResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PresenceStatusDTO {
  userId: number;
  isOnline: boolean;
  lastSeen?: string;
}

export interface ConversationUI extends ConversationResponseDTO {
  isTyping: boolean;
  isOnline: boolean;
  lastSeen?: string;
}

export interface MessageUI extends MessageDTO {
  isRead?: boolean;
  isSending?: boolean;
  sendError?: string;
}
