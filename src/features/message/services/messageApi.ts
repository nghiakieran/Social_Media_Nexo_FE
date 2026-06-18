import api from "@/lib/axios";
import type {
  ResponseData,
  PageModelResponse,
  ConversationResponseDTO,
  MessageDTO,
  ReactMessageRequest,
  EReactionType,
  ReactionDetailDTO,
  CreateGroupRequest,
  UpdateGroupRequest,
  AddMembersRequest,
} from "../types";

const BASE_PATH = "";

export const conversationApi = {
  getOrCreateConversation: async (recipientUserId: number) => {
    const response = await api.get<ResponseData<ConversationResponseDTO>>(
      `${BASE_PATH}/conversations/${recipientUserId}`
    );
    return response.data;
  },

  getConversationNickname: async (conversationId: number) => {
    const response = await api.get<ResponseData<ConversationResponseDTO>>(
      `${BASE_PATH}/conversations/${conversationId}/nickname`
    );
    return response.data;
  },

  getConversations: async (params?: {
    search?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await api.get<
      ResponseData<PageModelResponse<ConversationResponseDTO>>
    >(`${BASE_PATH}/conversations`, { params });
    return response.data;
  },

  getConversationRequests: async (params?: {
    search?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await api.get<
      ResponseData<PageModelResponse<ConversationResponseDTO>>
    >(`${BASE_PATH}/conversations/requests`, { params });
    return response.data;
  },

  getUnreadConversations: async (params?: {
    search?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await api.get<
      ResponseData<PageModelResponse<ConversationResponseDTO>>
    >(`${BASE_PATH}/conversations/unread`, { params });
    return response.data;
  },

  getArchivedConversations: async (params?: {
    search?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await api.get<
      ResponseData<PageModelResponse<ConversationResponseDTO>>
    >(`${BASE_PATH}/conversations/archived`, { params });
    return response.data;
  },

  toggleArchiveConversation: async (conversationId: number) => {
    const response = await api.put<ResponseData>(
      `${BASE_PATH}/conversations/${conversationId}/archive`
    );
    return response.data;
  },

  toggleMuteConversation: async (conversationId: number) => {
    const response = await api.put<ResponseData>(
      `${BASE_PATH}/conversations/${conversationId}/mute`
    );
    return response.data;
  },

  declineConversationRequest: async (conversationId: number) => {
    const response = await api.put<ResponseData>(
      `${BASE_PATH}/conversations/${conversationId}/decline`
    );
    return response.data;
  },

  acceptConversationRequest: async (conversationId: number) => {
    const response = await api.put<ResponseData>(
      `${BASE_PATH}/conversations/${conversationId}/accept`
    );
    return response.data;
  },

  updateNickname: async (
    conversationId: number,
    userId: number,
    nickname: string
  ) => {
    const response = await api.put<ResponseData>(
      `${BASE_PATH}/conversations/${conversationId}/nickname`,
      { userId, nickname }
    );
    return response.data;
  },

  // ─── Group ─────────────────────────────────────────────────────────────────

  createGroup: async (request: CreateGroupRequest) => {
    const response = await api.post<ResponseData<ConversationResponseDTO>>(
      `${BASE_PATH}/conversations/group`,
      request
    );
    return response.data;
  },

  updateGroup: async (conversationId: number, request: UpdateGroupRequest) => {
    const response = await api.put<ResponseData<ConversationResponseDTO>>(
      `${BASE_PATH}/conversations/${conversationId}/group`,
      request
    );
    return response.data;
  },

  addMembers: async (conversationId: number, request: AddMembersRequest) => {
    const response = await api.post<ResponseData<ConversationResponseDTO>>(
      `${BASE_PATH}/conversations/${conversationId}/group/members`,
      request
    );
    return response.data;
  },

  removeMember: async (conversationId: number, targetUserId: number) => {
    const response = await api.delete<ResponseData>(
      `${BASE_PATH}/conversations/${conversationId}/group/members/${targetUserId}`
    );
    return response.data;
  },

  leaveGroup: async (conversationId: number) => {
    const response = await api.post<ResponseData>(
      `${BASE_PATH}/conversations/${conversationId}/group/leave`
    );
    return response.data;
  },

  promoteAdmin: async (conversationId: number, targetUserId: number) => {
    const response = await api.put<ResponseData>(
      `${BASE_PATH}/conversations/${conversationId}/group/members/${targetUserId}/promote`
    );
    return response.data;
  },

  demoteAdmin: async (conversationId: number, targetUserId: number) => {
    const response = await api.put<ResponseData>(
      `${BASE_PATH}/conversations/${conversationId}/group/members/${targetUserId}/demote`
    );
    return response.data;
  },
};

export const messageApi = {
  getMessages: async (params: {
    conversationId: number;
    page?: number;
    size?: number;
    search?: string;
  }) => {
    const response = await api.get<ResponseData<PageModelResponse<MessageDTO>>>(
      `${BASE_PATH}/messages`,
      { params }
    );
    return response.data;
  },

  getReactions: async (messageId: number) => {
    const response = await api.get<ResponseData<ReactionDetailDTO[]>>(
      `${BASE_PATH}/messages/${messageId}/reactions`
    );
    return response.data;
  },

  addReaction: async (messageId: number, reactionType: EReactionType) => {
    const request: ReactMessageRequest = { reactionType };
    const response = await api.post<ResponseData>(
      `${BASE_PATH}/messages/${messageId}/reactions`,
      request
    );
    return response.data;
  },

  removeReaction: async (messageId: number, reactionType: EReactionType) => {
    const response = await api.delete<ResponseData>(
      `${BASE_PATH}/messages/${messageId}/reactions`,
      { params: { reactionType } }
    );
    return response.data;
  },
};
