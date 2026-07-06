import { useEffect, useState } from "react";
import { useAppDispatch } from "@/store";
import { addNotification } from "@/features/notification/notificationSlice";
import { fetchPendingRequestsCountThunk } from "@/features/message/messageSlice";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
export const useWebSocket = (token: string, username: string) => {
  const dispatch = useAppDispatch();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token || !username) {
      setIsConnected(false);
      return;
    }

    const baseUrl = import.meta.env.VITE_WS_URL || "http://localhost:8080";
    const socket = new SockJS(`${baseUrl}/api/notifications/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      // Khi kết nối thành công
      onConnect: () => {
        setIsConnected(true);

        stompClient.subscribe("/user/queue/notifications", (message) => {
          try {
            const newNotification = JSON.parse(message.body);
            dispatch(addNotification(newNotification));
            
            // Cập nhật số lượng tin nhắn chờ khi có thông báo (backend có thể gửi MESSAGE/MESSAGE_REQUEST)
            if (
              newNotification.notificationType === "MESSAGE_REQUEST" ||
              newNotification.notificationType === "MESSAGE" ||
              !newNotification.notificationType // fallback
            ) {
              dispatch(fetchPendingRequestsCountThunk());
            }
          } catch (error) {
            console.error("Lỗi parse JSON từ thông báo:", error);
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onStompError: (frame) => {
        setIsConnected(false);
      },
      onWebSocketError: (event) => {
        setIsConnected(false);
      },
      reconnectDelay: 5000,
    });

    stompClient.activate();

    return () => {
      if (stompClient.connected) {
        stompClient.deactivate();
      }
    };
  }, [token, username, dispatch]);

  return { isConnected };
};
