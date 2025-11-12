

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useWebSocket } from "../hooks";
import {
  fetchConversations,
  fetchMessages,
  fetchOnlineFriends,
  setActiveConversation,
  addMessage,
  handleTypingNotification,
  clearTypingNotification,
  handleReadReceipt,
  handleReadAll,
  addReaction,
} from "../messageSlice";
import { EMessageType, EReactionType } from "../types";

export const MessageIntegrationExample: React.FC = () => {
  const dispatch = useAppDispatch();
  const { conversations, activeConversationId, messages, onlineUserIds } =
    useAppSelector((state) => state.message);

  const {
    isConnected,
    connect,
    disconnect,
    subscribeToConversation,
    unsubscribeFromConversation,
    sendMessage,
    sendTyping,
    markConversationAsRead,
  } = useWebSocket({
    onMessage: (message) => {
            dispatch(addMessage(message));
    },

    onTyping: (notification) => {
            dispatch(handleTypingNotification(notification));

      setTimeout(() => {
        if (notification.userId) {
          dispatch(
            clearTypingNotification({
              conversationId: notification.conversationId,
              userId: notification.userId,
            })
          );
        }
      }, 3000);
    },

    onReadReceipt: (receipt) => {
            dispatch(handleReadReceipt(receipt));
    },

    onReadAll: (receipt) => {
            dispatch(handleReadAll(receipt));
    },

    onError: (error) => {
          },

    autoConnect: true,
  });

  useEffect(() => {
    dispatch(fetchConversations({ page: 0, size: 20 }));
    dispatch(fetchOnlineFriends());
  }, [dispatch]);

  useEffect(() => {
    if (isConnected && activeConversationId) {
      subscribeToConversation(activeConversationId);

      dispatch(
        fetchMessages({
          conversationId: activeConversationId,
          page: 0,
          size: 50,
        })
      );

      return () => {
        unsubscribeFromConversation(activeConversationId);
      };
    }
  }, [
    isConnected,
    activeConversationId,
    dispatch,
    subscribeToConversation,
    unsubscribeFromConversation,
  ]);

  const handleSendMessage = (content: string) => {
    if (!activeConversationId) return;

    try {
      sendMessage(activeConversationId, content, EMessageType.TEXT);
    } catch (error) {
          }
  };

  const handleTyping = () => {
    if (activeConversationId) {
      sendTyping(activeConversationId);
    }
  };

  const handleMarkAsRead = () => {
    if (activeConversationId) {
      markConversationAsRead(activeConversationId);
    }
  };

  const handleAddReaction = (messageId: number) => {
    if (!activeConversationId) return;

    dispatch(
      addReaction({
        conversationId: activeConversationId,
        messageId,
        reaction: {
          userId: 1, // Replace with actual current user ID
          username: "currentUser",
          reactionType: EReactionType.LIKE,
        },
      })
    );
  };

  return (
    <div>
      <h1>Message Integration Example</h1>
      <div>
        <p>WebSocket Status: {isConnected ? "Connected" : "Disconnected"}</p>
        <p>Active Conversation: {activeConversationId}</p>
        <p>Total Conversations: {conversations.length}</p>
        <p>Online Users: {onlineUserIds.length}</p>
      </div>

      {}
      <div>
        <h2>Conversations</h2>
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => dispatch(setActiveConversation(conv.id))}
            style={{
              padding: "10px",
              background:
                conv.id === activeConversationId ? "#e0e0e0" : "white",
              cursor: "pointer",
            }}
          >
            <div>
              <strong>{conv.fullname}</strong>
              {conv.isOnline && <span> (Online)</span>}
              {conv.isTyping && <span> (Typing...)</span>}
            </div>
            {conv.lastMessage && (
              <div style={{ fontSize: "0.9em", color: "#666" }}>
                {conv.lastMessage.content}
              </div>
            )}
            {conv.unreadCount > 0 && (
              <span
                style={{
                  background: "red",
                  color: "white",
                  padding: "2px 6px",
                  borderRadius: "10px",
                }}
              >
                {conv.unreadCount}
              </span>
            )}
          </div>
        ))}
      </div>

      {}
      {activeConversationId && (
        <div>
          <h2>Messages</h2>
          <div>
            {messages[activeConversationId]?.map((msg) => (
              <div
                key={msg.id}
                style={{ padding: "5px", borderBottom: "1px solid #eee" }}
              >
                <div>
                  <strong>{msg.sender.fullName}</strong>: {msg.content}
                </div>
                <div style={{ fontSize: "0.8em", color: "#999" }}>
                  {new Date(msg.createdAt).toLocaleString()}
                </div>
                {msg.reactions.length > 0 && (
                  <div>
                    Reactions:{" "}
                    {msg.reactions.map((r) => r.reactionType).join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>

          {}
          <div style={{ marginTop: "10px" }}>
            <input
              type="text"
              placeholder="Type a message..."
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage(e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
              onChange={handleTyping}
              style={{ width: "100%", padding: "10px" }}
            />
          </div>

          <button onClick={handleMarkAsRead}>Mark as Read</button>
        </div>
      )}
    </div>
  );
};
