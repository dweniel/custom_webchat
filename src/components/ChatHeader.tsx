import React from 'react';
import { motion } from 'framer-motion';
import { Minus, X, Wifi, WifiOff } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  onMinimize: () => void;
  onClose: () => void;
}

export function ChatHeader({ title, subtitle, avatarUrl, onMinimize, onClose }: ChatHeaderProps) {
  const { isConnected, connectionStatus } = useChatContext();

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Online';
      case 'connecting':
        return 'Conectando...';
      case 'error':
        return 'Erro de conexão';
      default:
        return 'Offline';
    }
  };

  return (
    <div className="chat-header">
      <div className="chat-header-info">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={title} 
            className="chat-header-avatar"
          />
        ) : (
          <div className="chat-header-avatar chat-header-avatar--default">
            <span>{title.charAt(0).toUpperCase()}</span>
          </div>
        )}
        
        <div className="chat-header-text">
          <h3 className="chat-header-title">{title}</h3>
          <div className="chat-header-status">
            <motion.span
              className={`chat-header-status-dot ${isConnected ? 'chat-header-status-dot--online' : ''}`}
              animate={{
                scale: isConnected ? [1, 1.2, 1] : 1,
              }}
              transition={{
                repeat: isConnected ? Infinity : 0,
                duration: 2,
              }}
            />
            <span className="chat-header-status-text">
              {subtitle || getStatusText()}
            </span>
          </div>
        </div>
      </div>

      <div className="chat-header-actions">
        <motion.button
          className="chat-header-btn"
          onClick={onMinimize}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Minimizar"
        >
          <Minus size={18} />
        </motion.button>
        <motion.button
          className="chat-header-btn"
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Fechar"
        >
          <X size={18} />
        </motion.button>
      </div>
    </div>
  );
}
