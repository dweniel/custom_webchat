// Exports principais
export { ChatWidget } from './components';
export { ChatProvider, useChatContext } from './context/ChatContext';
export { useWeniSocket } from './hooks/useWeniSocket';

// Types
export type {
  WebChatConfig,
  Message,
  MessageMetadata,
  QuickReply,
  CarouselItem,
  CarouselButton,
  SocketEventHandlers,
  SocketMessageEvent,
  ChatState,
  ConnectionStatus,
} from './types';
