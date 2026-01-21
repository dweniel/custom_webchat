import React, { createContext, useContext, useMemo } from 'react';
import { useWeniSocket } from '../hooks/useWeniSocket';
import type { WebChatConfig, Message, ConnectionStatus } from '../types';

interface ChatContextValue {
  messages: Message[];
  isConnected: boolean;
  isConnecting: boolean;
  isTyping: boolean;
  connectionStatus: ConnectionStatus;
  sessionId: string | null;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (text: string) => void;
  sendQuickReply: (payload: string, title: string) => void;
  clearMessages: () => void;
  setCustomField: (field: string, value: unknown) => void;
  setContext: (context: Record<string, unknown>) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

interface ChatProviderProps {
  config: WebChatConfig;
  children: React.ReactNode;
}

export function ChatProvider({ config, children }: ChatProviderProps) {
  const socket = useWeniSocket(config);

  const value = useMemo(() => ({
    messages: socket.messages,
    isConnected: socket.isConnected,
    isConnecting: socket.isConnecting,
    isTyping: socket.isTyping,
    connectionStatus: socket.connectionStatus,
    sessionId: socket.sessionId,
    error: socket.error,
    connect: socket.connect,
    disconnect: socket.disconnect,
    sendMessage: socket.sendMessage,
    sendQuickReply: socket.sendQuickReply,
    clearMessages: socket.clearMessages,
    setCustomField: socket.setCustomField,
    setContext: socket.setContext,
  }), [socket]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
