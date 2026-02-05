import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { ChatProvider, useChatContext } from '../context/ChatContext';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import type { WebChatConfig } from '../types';
import './ChatWidget.css';

interface ChatWidgetProps {
  config: WebChatConfig;
  autoConnect?: boolean;
  startOpen?: boolean;
}

export function ChatWidget({ config, autoConnect = true, startOpen = false }: ChatWidgetProps) {
  return (
    <ChatProvider config={config}>
      <ChatWidgetInner 
        config={config} 
        autoConnect={autoConnect} 
        startOpen={startOpen}
      />
    </ChatProvider>
  );
}

function ChatWidgetInner({ config, autoConnect, startOpen }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(startOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const { connect, isConnected, messages, connectionStatus, error } = useChatContext();
  
  // Verificar se há Channel UUID configurado
  const hasChannelUuid = Boolean(config.channelUuid && config.channelUuid.trim());
  
  // Verificar se há erro de conexão (UUID inválido, servidor não encontrado, etc)
  const hasConnectionError = connectionStatus === 'error' || error !== null;

  // Auto-conectar quando configurado
  useEffect(() => {
    if (autoConnect && isOpen && !isConnected) {
      console.log('[ChatWidget] Auto-conectando...');
      connect();
    }
  }, [autoConnect, isOpen, isConnected, connect]);

  // Conectar ao abrir o chat (mesmo sem autoConnect)
  const handleOpen = () => {
    setIsOpen(true);
    // Só conecta se tiver channelUuid configurado
    if (!isConnected && hasChannelUuid) {
      console.log('[ChatWidget] Chat aberto, conectando...');
      setTimeout(() => connect(), 100);
    }
  };

  // Desconectar ao fechar (opcional)
  const handleClose = () => {
    setIsOpen(false);
    // Descomente se quiser desconectar ao fechar:
    // disconnect();
  };

  const handleToggle = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else if (isOpen) {
      setIsOpen(false);
    } else {
      handleOpen();
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Badge de notificações desabilitado para evitar bugs visuais
  // const unreadCount = isOpen ? 0 : messages.filter(m => m.sender === 'bot').length;

  // CSS Variables baseadas na config
  // Determinar se está em modo claro baseado na cor de fundo
  const isLightMode = config.themeMode === 'light' || 
    (config.backgroundColor && ['#ffffff', '#fff', '#f8fafc', '#f1f5f9'].includes(config.backgroundColor.toLowerCase()));

  const cssVars = {
    '--chat-primary': config.primaryColor || '#6366f1',
    '--chat-secondary': config.secondaryColor || '#818cf8',
    '--chat-background': config.backgroundColor || '#0f0f23',
    '--chat-text': config.textColor || (isLightMode ? '#1e293b' : '#e2e8f0'),
    '--chat-text-muted': isLightMode ? '#64748b' : '#94a3b8',
    '--chat-surface': isLightMode ? '#ffffff' : '#1e1e3f',
    '--chat-surface-light': isLightMode ? '#f1f5f9' : '#252550',
    '--chat-border': isLightMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.4)',
    '--chat-user-bubble': config.userMessageColor || '#6366f1',
    '--chat-bot-bubble': config.botMessageColor || (isLightMode ? '#f1f5f9' : '#1e1e3f'),
    '--chat-header': config.headerColor || config.primaryColor || '#6366f1',
    '--chat-footer': config.footerColor || (isLightMode ? '#f8fafc' : '#1e1e3f'),
    '--chat-text-header': config.textHeaderColor || '#ffffff',
    '--chat-text-input': config.textInputColor || (isLightMode ? '#1e293b' : '#e2e8f0'),
    '--chat-text-placeholder': config.textPlaceholderColor || '#94a3b8',
    '--chat-text-user-message': config.textUserMessageColor || '#ffffff',
    '--chat-text-bot-message': config.textBotMessageColor || (isLightMode ? '#1e293b' : '#e2e8f0'),
  } as React.CSSProperties;

  return (
    <div className="chat-widget-container" style={cssVars}>
      {/* Widget Flutuante */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            className="chat-widget"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <ChatHeader
              title={config.title || 'Chat'}
              subtitle={config.subtitle}
              avatarUrl={config.avatarUrl}
              onMinimize={handleMinimize}
              onClose={handleClose}
            />
            
            <div className="chat-body">
              {/* Mensagem quando não há Channel UUID */}
              {!hasChannelUuid ? (
                <div className="chat-config-warning">
                  <div className="chat-config-warning-icon">⚠️</div>
                  <div className="chat-config-warning-title">Channel UUID não configurado</div>
                  <div className="chat-config-warning-text">
                    Por favor, insira o Channel UUID na aba "Conexão" para iniciar o chat.
                  </div>
                </div>
              ) : hasConnectionError ? (
                /* Mensagem de erro de conexão */
                <div className="chat-config-warning chat-config-error">
                  <div className="chat-config-warning-icon">❌</div>
                  <div className="chat-config-warning-title">Erro de conexão</div>
                  <div className="chat-config-warning-text">
                    {error?.message || 'Não foi possível conectar. Verifique se o Channel UUID está correto.'}
                  </div>
                  <button 
                    className="chat-retry-btn"
                    onClick={() => connect()}
                  >
                    🔄 Tentar novamente
                  </button>
                </div>
              ) : (
                <>
                  <ChatMessages welcomeMessage={config.welcomeMessage} />
                  <TypingIndicator avatarUrl={config.avatarUrl} />
                </>
              )}
            </div>
            
            <ChatInput placeholder={config.inputPlaceholder} disabled={!hasChannelUuid || hasConnectionError} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimizado */}
      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.div
            className="chat-minimized"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => setIsMinimized(false)}
          >
            <div className="chat-minimized-content">
              <span className="chat-minimized-title">
                {messages.length > 0 ? (
                  messages[messages.length - 1].sender === 'user' 
                    ? `Você disse: ${messages[messages.length - 1].text.substring(0, 30)}${messages[messages.length - 1].text.length > 30 ? '...' : ''}`
                    : `${config.title || 'Agente'} disse: ${messages[messages.length - 1].text.substring(0, 30)}${messages[messages.length - 1].text.length > 30 ? '...' : ''}`
                ) : (config.title || 'Chat')}
              </span>
              <button 
                className="chat-minimized-close"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão Launcher */}
      <motion.button
        className={`chat-launcher ${isOpen ? 'chat-launcher--open' : ''}`}
        onClick={handleToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="chat-launcher-icon"
            >
              {config.avatarUrl ? (
                <img 
                  src={config.avatarUrl} 
                  alt="Avatar" 
                  className="chat-launcher-avatar"
                />
              ) : (
                <MessageCircle size={24} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge de mensagens não lidas - desabilitado para evitar bugs visuais */}
      </motion.button>
    </div>
  );
}
