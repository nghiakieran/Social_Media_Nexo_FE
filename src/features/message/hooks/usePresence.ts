import { useEffect, useState, useCallback } from "react";
import { presenceApi } from "../services/presenceApi";
import type { PresenceStatusDTO } from "../types";

interface UsePresenceOptions {
  userId?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
}

export const usePresence = (options: UsePresenceOptions = {}) => {
  const { userId, autoRefresh = false, refreshInterval = 30 } = options;
  const [presence, setPresence] = useState<PresenceStatusDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPresence = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const isOnline = await presenceApi.checkUserOnline(userId);

      let lastSeen: string | undefined = undefined;
      if (!isOnline.data) {
        const lastSeenResponse = await presenceApi.getLastSeen(userId);
        lastSeen = lastSeenResponse.data;
      }

      setPresence({
        userId,
        isOnline: isOnline.data,
        lastSeen,
      });
    } catch (err) {
      setError(err as Error);
      setPresence(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPresence();
  }, [fetchPresence]);

  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const interval = setInterval(() => {
      fetchPresence();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, userId, fetchPresence]);

  return {
    presence,
    isLoading,
    error,
    refetch: fetchPresence,
  };
};

export const useBatchPresence = (userIds: number[]) => {
  const [presenceMap, setPresenceMap] = useState<Record<number, boolean>>({});
  const [lastSeenMap, setLastSeenMap] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBatchPresence = useCallback(async () => {
    if (userIds.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const onlineResponse = await presenceApi.getBatchOnlineStatus(userIds);
      const onlineStatuses = onlineResponse.data;
      setPresenceMap(onlineStatuses);

      const offlineUserIds = Object.keys(onlineStatuses)
        .filter((id) => !onlineStatuses[parseInt(id)])
        .map((id) => parseInt(id));

      if (offlineUserIds.length > 0) {
        const lastSeenPromises = offlineUserIds.map((id) =>
          presenceApi.getLastSeen(id)
        );
        const lastSeenResults = await Promise.all(lastSeenPromises);

        const lastSeenData: Record<number, string> = {};
        offlineUserIds.forEach((id, index) => {
          if (lastSeenResults[index]?.data) {
            lastSeenData[id] = lastSeenResults[index].data;
          }
        });

        setLastSeenMap(lastSeenData);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [userIds]);

  useEffect(() => {
    fetchBatchPresence();
  }, [fetchBatchPresence]);

  return {
    presenceMap,
    lastSeenMap,
    isLoading,
    error,
    refetch: fetchBatchPresence,
  };
};

export const formatLastSeen = (lastSeenTimestamp?: string): string => {
  if (!lastSeenTimestamp) return "";

  const now = new Date();
  const lastSeen = new Date(lastSeenTimestamp);
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "Vừa hoạt động";
  if (diffMinutes < 60) return `Hoạt động ${diffMinutes} phút trước`;
  if (diffHours < 24) return `Hoạt động ${diffHours} giờ trước`;
  if (diffDays === 1) return "Hoạt động hôm qua";
  if (diffDays < 7) return `Hoạt động ${diffDays} ngày trước`;
  return "";
};
