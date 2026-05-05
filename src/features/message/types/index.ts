export enum EMessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  FILE = "FILE",
  STORY = "STORY",
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
  storyId?: number | null;
  storyMediaUrl?: string | null;
  isEdited?: boolean | null;
  editedAt?: string | null;
  createdAt: string;
}

export interface ConversationResponseDTO {
  id: number;
  fullname: string;
  avatarUrl: string;
  username: string;
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
  // Group fields
  isGroup?: boolean;
  groupName?: string;
  groupAvatarUrl?: string;
  createdByUserId?: number;
  isGroupAdmin?: boolean;
}

export interface CreateGroupRequest {
  groupName: string;
  groupAvatarUrl?: string;
  memberUserIds: number[];
}

export interface UpdateGroupRequest {
  groupName?: string;
  groupAvatarUrl?: string;
}

export interface AddMembersRequest {
  userIds: number[];
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

/** Payload STOMP topic reactions  */
export type ReactionWebSocketPayload =
  | ReactionUpdateDTO
  | ReactionUpdateLegacyDTO;

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

// ─── Call types ────────────────────────────────────────────────────────────

export enum ECallType {
  AUDIO_CALL = "AUDIO_CALL",
  VIDEO_CALL = "VIDEO_CALL",
}

export enum ECallStatus {
  INITIATED = "INITIATED",
  RINGING = "RINGING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  ENDED = "ENDED",
  MISSED = "MISSED",
  BUSY = "BUSY",
}

export interface CallNotificationDTO {
  callId: number;
  conversationId: number;
  callerId: number;
  callerUsername: string;
  callerFullName: string;
  callerAvatarUrl: string;
  callType: ECallType;
  startedAt: string;
}

export interface CallResponseDTO {
  callId: number;
  responderId: number;
  responderUsername: string;
  status: ECallStatus;
}

export interface CallSignalDTO {
  callId: number;
  senderId: number;
  type: "OFFER" | "ANSWER" | "ICE_CANDIDATE";
  sdp?: string;
  candidate?: string;
}

export interface CallEndedDTO {
  callId: number;
  endedByUserId: number;
  finalStatus: ECallStatus;
  durationSeconds: number | null;
  endedAt: string;
}

export interface CallInitiateRequest {
  conversationId: number;
  callType: ECallType;
}

export interface CallResponseRequest {
  callId: number;
  accepted: boolean;
}

export interface CallSignalRequest {
  callId: number;
  type: "OFFER" | "ANSWER" | "ICE_CANDIDATE";
  sdp?: string;
  candidate?: string;
}

export interface CallEndRequest {
  callId: number;
}
