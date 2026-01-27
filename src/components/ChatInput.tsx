import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';

interface ChatInputProps {
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ placeholder = 'Digite sua mensagem...', disabled = false }: ChatInputProps) {
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
        {/* Campo de texto */}
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={disabled ? 'Configure o Channel UUID...' : placeholder}
            className="chat-input-field"
            rows={1}
            disabled={disabled}
          />
        </div>

        {/* Botão de enviar */}
        <div className="chat-input-actions">
          <motion.button
            type="submit"
            className={`chat-input-btn ${message.trim() ? 'chat-input-btn--send' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Enviar mensagem"
            disabled={!message.trim()}
          >
            <Send size={20} />
          </motion.button>
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
