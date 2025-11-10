import api from "@/lib/axios";
import type { ResponseData } from "../types";

const BASE_PATH = "/presence";

export const presenceApi = {
  
  checkUserOnline: async (targetUserId: number) => {
    const response = await api.get<ResponseData<boolean>>(
      `${BASE_PATH}/online/${targetUserId}`
    );
    return response.data;
  },

  
  getBatchOnlineStatus: async (userIds: number[]) => {
    const response = await api.post<ResponseData<Record<number, boolean>>>(
      `${BASE_PATH}/online/batch`,
      userIds
    );
    return response.data;
  },

  
  getOnlineFriends: async () => {
    const response = await api.get<ResponseData<number[]>>(
      `${BASE_PATH}/online/friends`
    );
    return response.data;
  },

  
  getLastSeen: async (targetUserId: number) => {
    const response = await api.get<ResponseData<string>>(
      `${BASE_PATH}/last-seen/${targetUserId}`
    );
    return response.data;
  },

  
  getOnlineCount: async () => {
    const response = await api.get<ResponseData<number>>(
      `${BASE_PATH}/online/count`
    );
    return response.data;
  },

  
  clearCache: async () => {
    const response = await api.post<ResponseData>(`${BASE_PATH}/clear-cache`);
    return response.data;
  },
};
