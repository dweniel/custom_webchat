import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../context/ChatContext';
import { MessageBubble } from './MessageBubble';
import { QuickReplies } from './QuickReplies';
import type { Message } from '../types';

export function ChatMessages() {
  const { messages, isConnected } = useChatContext();
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para nova mensagem
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Agrupar mensagens por data
  const groupedMessages = messages.reduce((groups, message) => {
    const dateKey = message.timestamp.toLocaleDateString('pt-BR');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  // Encontrar última mensagem do bot com quick replies
  const lastBotMessage = [...messages].reverse().find(m => m.sender === 'bot');
  const hasQuickReplies = lastBotMessage?.metadata?.quickReplies && lastBotMessage.metadata.quickReplies.length > 0;

  return (
    <div className="chat-messages" ref={containerRef}>
      {messages.length === 0 ? (
        <div className="chat-messages-empty">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="chat-messages-empty-content"
          >
            <div className="chat-messages-empty-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path
                  d="M24 4C12.954 4 4 12.954 4 24C4 35.046 12.954 44 24 44C35.046 44 44 35.046 44 24C44 12.954 35.046 4 24 4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M16 20C16 20 19 24 24 24C29 24 32 20 32 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="18" cy="16" r="2" fill="currentColor" />
                <circle cx="30" cy="16" r="2" fill="currentColor" />
              </svg>
            </div>
            <p className="chat-messages-empty-text">
              {isConnected 
                ? 'Olá! Como posso ajudar você hoje?' 
                : 'Conecte-se para iniciar a conversa'}
            </p>
          </motion.div>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {Object.entries(groupedMessages).map(([date, dayMessages]) => (
            <div key={date} className="chat-messages-group">
              <div className="chat-messages-date">
                <span>{formatDateLabel(date)}</span>
              </div>
              
              {dayMessages.map((message, index) => (
                <MessageBubble 
                  key={message.id} 
                  message={message}
                  isLast={index === dayMessages.length - 1}
                />
              ))}
            </div>
          ))}

          {/* Quick Replies da última mensagem */}
          {hasQuickReplies && lastBotMessage?.metadata?.quickReplies && (
            <QuickReplies replies={lastBotMessage.metadata.quickReplies} />
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

function formatDateLabel(dateStr: string): string {
  const today = new Date().toLocaleDateString('pt-BR');
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('pt-BR');
  
  if (dateStr === today) return 'Hoje';
  if (dateStr === yesterday) return 'Ontem';
  return dateStr;
}
