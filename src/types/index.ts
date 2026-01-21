export interface WebChatConfig {
  /** URL do socket WebSocket (ex: wss://websocket.weni.ai) */
  socketUrl: string;
  /** Host do servidor de flows (ex: https://flows.weni.ai) */
  host: string;
  /** UUID do canal configurado no Weni */
  channelUuid: string;
  /** Mensagem inicial enviada ao conectar */
  initPayload?: string;
  /** Token de sessão (se necessário) */
  sessionToken?: string;
  /** ID de sessão customizado */
  sessionId?: string;
  /** Dados customizados do usuário */
  customData?: Record<string, unknown>;
  /** Título do chat */
  title?: string;
  /** Subtítulo do chat */
  subtitle?: string;
  /** URL do avatar */
  avatarUrl?: string;
  /** Cor principal do tema */
  primaryColor?: string;
  /** Cor secundária */
  secondaryColor?: string;
  /** Cor de fundo */
  backgroundColor?: string;
  /** Cor do texto */
  textColor?: string;
  /** Cor das mensagens do usuário */
  userMessageColor?: string;
  /** Cor das mensagens do bot */
  botMessageColor?: string;
  /** Placeholder do input */
  inputPlaceholder?: string;
  /** Callback quando receber mensagem */
  onMessage?: (message: Message) => void;
  /** Callback quando conectar */
  onConnect?: () => void;
  /** Callback quando desconectar */
  onDisconnect?: () => void;
  /** Callback em caso de erro */
  onError?: (error: Error) => void;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'quick_reply' | 'carousel' | 'video' | 'audio';
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  quickReplies?: QuickReply[];
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  fileUrl?: string;
  fileName?: string;
  carousel?: CarouselItem[];
  products?: CarouselProduct[];
}

export interface QuickReply {
  title: string;
  payload: string;
}

export interface CarouselItem {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  buttons?: CarouselButton[];
}

export interface CarouselButton {
  title: string;
  payload?: string;
  url?: string;
  type: 'postback' | 'web_url';
}

/** Produto do carousel de e-commerce */
export interface CarouselProduct {
  id: string;
  name: string;
  description?: string;
  price: string;
  originalPrice?: string;
  discountPercentage?: number;
  imageUrl: string;
  productLink: string;
}

export interface SocketEventHandlers {
  onMessage?: (data: SocketMessageEvent) => void;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  onTyping?: (isTyping: boolean) => void;
  onSessionStart?: (sessionId: string) => void;
}

export interface SocketMessageEvent {
  type: string;
  text?: string;
  data?: unknown;
  quick_replies?: Array<{ title: string; payload: string }>;
  attachment?: {
    type: string;
    payload: {
      url?: string;
      elements?: CarouselItem[];
    };
  };
}

export interface ChatState {
  isConnected: boolean;
  isConnecting: boolean;
  isTyping: boolean;
  messages: Message[];
  sessionId: string | null;
  error: Error | null;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
