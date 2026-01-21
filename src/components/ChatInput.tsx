import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Mic, Smile } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';

interface ChatInputProps {
  placeholder?: string;
}

export function ChatInput({ placeholder = 'Digite sua mensagem...' }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isConnected, connect } = useChatContext();

  // Auto-resize do textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    if (!isConnected) {
      connect();
      // Aguardar conexão antes de enviar
      setTimeout(() => sendMessage(trimmedMessage), 500);
    } else {
      sendMessage(trimmedMessage);
    }
    
    setMessage('');
    
    // Reset height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`chat-input-container ${isFocused ? 'chat-input-container--focused' : ''}`}>
      <form onSubmit={handleSubmit} className="chat-input-form">
        {/* Botões de ação à esquerda */}
        <div className="chat-input-actions">
          <motion.button
            type="button"
            className="chat-input-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Anexar arquivo"
          >
            <Paperclip size={20} />
          </motion.button>
        </div>

        {/* Campo de texto */}
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="chat-input-field"
            rows={1}
          />
        </div>

        {/* Botões de ação à direita */}
        <div className="chat-input-actions">
          {message.trim() ? (
            <motion.button
              type="submit"
              className="chat-input-btn chat-input-btn--send"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              aria-label="Enviar mensagem"
            >
              <Send size={20} />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              className="chat-input-btn"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Gravar áudio"
            >
              <Mic size={20} />
            </motion.button>
          )}
        </div>
      </form>

      {/* Indicador de conexão */}
      {!isConnected && (
        <motion.div 
          className="chat-input-offline"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <span>Clique para conectar</span>
          <button onClick={() => {
            console.log('[ChatInput] Tentando conectar...');
            connect();
          }} className="chat-input-reconnect">
            🔌 Conectar
          </button>
        </motion.div>
      )}
    </div>
  );
}
