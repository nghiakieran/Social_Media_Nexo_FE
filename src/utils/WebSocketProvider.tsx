import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from "sockjs-client";

const WebSocketContext = createContext<Client | null>(null);
export const useWebSocket = () => useContext(WebSocketContext)!;

interface WebSocketProviderProps {
  children: ReactNode;
  onMessage?: (msg: IMessage) => void;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, onMessage }) => {
  const clientRef = useRef<Client | null>(null);

  // useEffect(() => {
  //   const client = new Client({
  //     brokerURL: 'ws://localhost:8080/ws-native',
  //     // webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
  //     connectHeaders: {
  //       Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  //     },
  //     reconnectDelay: 5000,
  //     debug: (msg) => console.log('%c[STOMP DEBUG]', 'color: gray', msg),
  //   });

  //   client.onConnect = (frame) => {
  //     console.log('%c[STOMP] Connected successfully', 'color: green', frame);

  //     // Subscribe kênh riêng user (Spring sẽ map Principal)
  //     const subscription = client.subscribe('/user/queue/notifications', (message) => {
  //       console.log('%c[STOMP] Received message:', 'color: blue', message.body);
  //       onMessage?.(message);
  //     });

  //     console.log('%c[STOMP] Subscribed to /user/queue/notifications', 'color: purple', subscription.id);
  //   };

  //   client.onStompError = (frame) => {
  //     console.error('%c[STOMP ERROR]', 'color: red', frame.headers['message'], frame.body);
  //   };

  //   client.onWebSocketError = (evt) => {
  //     console.error('%c[WebSocket ERROR]', 'color: red', evt);
  //   };

  //   client.activate();
  //   clientRef.current = client;

  //   return () => {
  //     if (clientRef.current && clientRef.current.active) {
  //       console.log('%c[STOMP] Disconnecting...', 'color: orange');
  //       clientRef.current.deactivate();
  //     }
  //   };
  // }, [onMessage]);

  return <WebSocketContext.Provider value={clientRef.current}>{children}</WebSocketContext.Provider>;
};