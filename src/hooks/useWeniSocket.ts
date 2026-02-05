import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { 
  WebChatConfig, 
  Message, 
  ChatState, 
  ConnectionStatus 
} from '../types';
import { isCarouselMessage, parseCarouselXml, extractTextFromCarouselMessage } from '../utils/carouselParser';

interface WeniMessageData {
  type?: string;
  text?: string;
  media?: string;
  messageId?: string;
  quick_replies?: Array<{ title: string; payload: string }>;
}

interface WeniServerMessage {
  type: string;
  message?: WeniMessageData;
  text?: string;
  error?: string;
  warning?: string;
  id?: string;
  // Campos de streaming
  v?: string;  // delta content
  seq?: number; // delta sequence number
  data?: {
    language?: string;
    [key: string]: unknown;
  };
}

// Estado de streaming ativo
interface StreamingState {
  id: string;
  text: string;
  timestamp: number;
}

const MESSAGE_ID_PREFIX = 'msg_';
const STREAM_INITIAL_SEQUENCE = 1;

/**
 * Hook personalizado para conectar ao socket do Weni
 * Baseado no protocolo real do @weni/webchat-service
 * 
 * Protocolo:
 * 1. Conectar a wss://socketUrl/ws
 * 2. Enviar mensagem de registro: { type: 'register', from: sessionId, callback, session_type }
 * 3. Esperar { type: 'ready_for_message' } do servidor
 * 4. Enviar mensagens: { type: 'message', message: { type: 'text', text: '...' }, from: sessionId }
 * 5. Manter conexão viva com ping: { type: 'ping' }
 */
export function useWeniSocket(config: WebChatConfig) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isRegisteredRef = useRef(false);
  const maxReconnectAttempts = 5;
  const pingInterval = 30000; // 30 segundos

  // Estado de streaming
  const streamsRef = useRef<Map<string, StreamingState>>(new Map());
  const activeStreamIdRef = useRef<string | null>(null);
  const pendingDeltasRef = useRef<Map<number, string>>(new Map());
  const nextExpectedSeqRef = useRef<number>(STREAM_INITIAL_SEQUENCE);
  const streamMessageEmittedRef = useRef<boolean>(false);

  const [state, setState] = useState<ChatState>({
    isConnected: false,
    isConnecting: false,
    isTyping: false,
    messages: [],
    sessionId: null,
    error: null,
  });

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  // Gerar ou recuperar session ID do localStorage
  const getSessionId = useCallback(() => {
    const storageKey = `weni_session_${config.channelUuid}`;
    let sessionId = config.sessionId || localStorage.getItem(storageKey);
    
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem(storageKey, sessionId);
    }
    
    return sessionId;
  }, [config.channelUuid, config.sessionId]);

  // Resetar estado de streaming
  const resetStreamState = useCallback((streamId: string | null = null) => {
    activeStreamIdRef.current = streamId;
    pendingDeltasRef.current = new Map();
    nextExpectedSeqRef.current = STREAM_INITIAL_SEQUENCE;
    streamMessageEmittedRef.current = false;
  }, []);

  // Extrair message ID do raw message
  const getMessageIdFromRaw = useCallback((raw: WeniServerMessage): string | null => {
    const id = raw?.message?.messageId || raw?.id;
    return id ? MESSAGE_ID_PREFIX + id : null;
  }, []);

  // Processar stream_start
  const processStreamStart = useCallback((raw: WeniServerMessage) => {
    const messageId = getMessageIdFromRaw(raw);
    if (!messageId) {
      console.error('[WebChat] stream_start recebido sem id');
      return;
    }

    console.log('[WebChat] 🌊 Iniciando streaming:', messageId);
    resetStreamState(messageId);
    streamsRef.current.set(messageId, { id: messageId, text: '', timestamp: Date.now() });
    
    // Mostrar indicador de digitação enquanto streaming começa
    setState(prev => ({ ...prev, isTyping: true }));
  }, [getMessageIdFromRaw, resetStreamState]);

  // Atualizar mensagem de streaming
  const updateStreamingMessage = useCallback((streamId: string, text: string) => {
    setState(prev => {
      const existingIndex = prev.messages.findIndex(m => m.id === streamId);
      
      if (existingIndex >= 0) {
        // Atualizar mensagem existente
        const updatedMessages = [...prev.messages];
        updatedMessages[existingIndex] = {
          ...updatedMessages[existingIndex],
          text,
          status: 'streaming',
        };
        return { ...prev, messages: updatedMessages, isTyping: false };
      } else {
        // Criar nova mensagem de streaming
        const newMessage: Message = {
          id: streamId,
          text,
          sender: 'bot',
          timestamp: new Date(),
          type: 'text',
          status: 'streaming',
        };
        return { ...prev, messages: [...prev.messages, newMessage], isTyping: false };
      }
    });
  }, []);

  // Aplicar conteúdo ao stream
  const appendStreamContent = useCallback((streamId: string, content: string) => {
    const current = streamsRef.current.get(streamId);
    if (!current) return;

    const mergedText = current.text + content;
    streamsRef.current.set(streamId, { ...current, text: mergedText, timestamp: Date.now() });
    
    updateStreamingMessage(streamId, mergedText);
  }, [updateStreamingMessage]);

  // Aplicar deltas pendentes em ordem
  const applyPendingDeltas = useCallback((streamId: string) => {
    while (pendingDeltasRef.current.has(nextExpectedSeqRef.current)) {
      const content = pendingDeltasRef.current.get(nextExpectedSeqRef.current)!;
      pendingDeltasRef.current.delete(nextExpectedSeqRef.current);
      appendStreamContent(streamId, content);
      nextExpectedSeqRef.current++;
    }
  }, [appendStreamContent]);

  // Processar delta
  const processDelta = useCallback((raw: WeniServerMessage) => {
    const seq = raw.seq;
    const content = raw.v || '';

    if (typeof seq !== 'number' || seq < STREAM_INITIAL_SEQUENCE) {
      return;
    }

    // Criar stream sintético se delta chegar sem stream_start
    if (!activeStreamIdRef.current) {
      const messageId = getMessageIdFromRaw(raw) || MESSAGE_ID_PREFIX + uuidv4();
      console.log('[WebChat] 🌊 Criando stream sintético:', messageId);
      resetStreamState(messageId);
      streamMessageEmittedRef.current = true;
      streamsRef.current.set(messageId, { id: messageId, text: '', timestamp: Date.now() });
    }

    const streamId = activeStreamIdRef.current!;

    // Verificar se é o primeiro delta
    if (nextExpectedSeqRef.current === STREAM_INITIAL_SEQUENCE && seq >= STREAM_INITIAL_SEQUENCE) {
      console.log('[WebChat] 🌊 Primeiro delta recebido');
      setState(prev => ({ ...prev, isTyping: false }));
      
      if (!streamMessageEmittedRef.current) {
        streamMessageEmittedRef.current = true;
        updateStreamingMessage(streamId, '');
      }
    }

    // Processar delta baseado na sequência
    if (seq === nextExpectedSeqRef.current) {
      // Em ordem - aplicar imediatamente
      appendStreamContent(streamId, content);
      nextExpectedSeqRef.current++;
      
      // Verificar deltas pendentes
      applyPendingDeltas(streamId);
    } else if (seq > nextExpectedSeqRef.current) {
      // Fora de ordem - buffer para depois
      pendingDeltasRef.current.set(seq, content);
    }
    // Ignorar seq < nextExpectedSeq (duplicado)
  }, [getMessageIdFromRaw, resetStreamState, appendStreamContent, applyPendingDeltas, updateStreamingMessage]);

  // Processar stream_end
  const processStreamEnd = useCallback((raw: WeniServerMessage) => {
    const messageId = getMessageIdFromRaw(raw);
    if (!messageId) {
      console.error('[WebChat] stream_end recebido sem id');
      return;
    }

    console.log('[WebChat] 🌊 Finalizando streaming:', messageId);
    setState(prev => ({ ...prev, isTyping: false }));

    const streamData = streamsRef.current.get(messageId);
    const finalText = streamData?.text || '';

    // Atualizar mensagem para status delivered
    setState(prev => {
      const existingIndex = prev.messages.findIndex(m => m.id === messageId);
      
      if (existingIndex >= 0) {
        const updatedMessages = [...prev.messages];
        updatedMessages[existingIndex] = {
          ...updatedMessages[existingIndex],
          text: finalText,
          status: 'delivered',
        };
        return { ...prev, messages: updatedMessages };
      }
      return prev;
    });

    // Cleanup
    streamsRef.current.delete(messageId);
    if (activeStreamIdRef.current === messageId) {
      resetStreamState();
    }
  }, [getMessageIdFromRaw, resetStreamState]);

  // Detectar tipo de mensagem
  const extractMessageType = useCallback((raw: WeniServerMessage): string => {
    // delta messages têm 'v' e 'seq' mas não 'type'
    if ('v' in raw && 'seq' in raw && !('type' in raw)) {
      return 'delta';
    }
    if (raw.type) {
      return raw.type;
    }
    if (raw.message && raw.message.type) {
      return raw.message.type;
    }
    return 'unknown';
  }, []);

  // Processar mensagem do servidor
  const handleServerMessage = useCallback((data: WeniServerMessage) => {
    console.log('[WebChat] 📨 Processando mensagem:', data);
    
    const messageType = extractMessageType(data);

    // Processar streaming
    if (messageType === 'stream_start') {
      processStreamStart(data);
      return;
    }

    if (messageType === 'delta') {
      processDelta(data);
      return;
    }

    if (messageType === 'stream_end') {
      processStreamEnd(data);
      return;
    }
    
    // Ignorar mensagens de controle
    if (data.type === 'pong') {
      return;
    }

    if (data.type === 'ready_for_message') {
      console.log('[WebChat] ✅ Servidor pronto para receber mensagens');
      isRegisteredRef.current = true;
      
      // Se tiver initPayload, enviar agora
      if (config.initPayload && wsRef.current?.readyState === WebSocket.OPEN) {
        const sessionId = state.sessionId || getSessionId();
        const initMessage = {
          type: 'message',
          message: {
            type: 'text',
            text: config.initPayload,
          },
          context: '',
          from: sessionId,
        };
        console.log('[WebChat] 📤 Enviando initPayload:', initMessage);
        wsRef.current.send(JSON.stringify(initMessage));
      }
      return;
    }

    if (data.type === 'project_language') {
      console.log('[WebChat] 🌍 Idioma do projeto:', data.data?.language);
      return;
    }

    if (data.type === 'allow_contact_timeout') {
      console.log('[WebChat] ⏱️ Timeout de contato permitido');
      return;
    }

    // Tratar erros
    if (data.type === 'error') {
      console.error('[WebChat] ⚠️ Erro do servidor:', data.error);
      
      // Erro de registro duplicado - fechar outras conexões
      if (data.error?.includes('already exists')) {
        console.log('[WebChat] Outra conexão existe, tentando reconectar...');
      }
      return;
    }

    if (data.type === 'warning') {
      console.warn('[WebChat] ⚠️ Aviso:', data.warning);
      return;
    }

    // Processar indicador de digitação (ANTES de mensagens para não ser ignorado)
    if (data.type === 'typing' || data.type === 'typing_start') {
      console.log('[WebChat] ✏️ Bot está digitando...');
      setState(prev => ({ ...prev, isTyping: true }));
      return;
    }
    
    if (data.type === 'typing_stop') {
      console.log('[WebChat] ✏️ Bot parou de digitar');
      setState(prev => ({ ...prev, isTyping: false }));
      return;
    }

    // Processar mensagem do bot
    if (data.type === 'message' || data.message) {
      const messageData: WeniMessageData = data.message || {};
      
      // Extrair texto
      let text = '';
      if (typeof messageData.text === 'string') {
        text = messageData.text;
      } else if (typeof data.text === 'string') {
        text = data.text;
      }

      if (!text && !messageData.media && !messageData.quick_replies) {
        console.log('[WebChat] Mensagem sem conteúdo, ignorando');
        return;
      }

      // Verificar se é uma mensagem de carousel de produtos
      if (isCarouselMessage(text)) {
        console.log('[WebChat] 🛒 Detectado carousel de produtos');
        const products = parseCarouselXml(text);
        const remainingText = extractTextFromCarouselMessage(text);
        
        if (products.length > 0) {
          const carouselMessage: Message = {
            id: uuidv4(),
            text: remainingText,
            sender: 'bot',
            timestamp: new Date(),
            type: 'carousel',
            metadata: {
              products,
            },
          };

          setState(prev => ({
            ...prev,
            messages: [...prev.messages, carouselMessage],
            isTyping: false,
          }));

          config.onMessage?.(carouselMessage);
          return;
        }
      }

      const message: Message = {
        id: uuidv4(),
        text,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
        metadata: {},
      };

      // Processar quick replies
      if (messageData.quick_replies && messageData.quick_replies.length > 0) {
        message.type = 'quick_reply';
        message.metadata = {
          quickReplies: messageData.quick_replies.map((qr: { title: string; payload: string }) => ({
            title: qr.title,
            payload: qr.payload,
          })),
        };
      }

      // Processar mídia
      if (messageData.type === 'image' && messageData.media) {
        message.type = 'image';
        message.metadata = { imageUrl: messageData.media };
      } else if (messageData.type === 'video' && messageData.media) {
        message.type = 'video';
        message.metadata = { videoUrl: messageData.media };
      } else if (messageData.type === 'audio' && messageData.media) {
        message.type = 'audio';
        message.metadata = { audioUrl: messageData.media };
      } else if (messageData.type === 'file' && messageData.media) {
        message.type = 'file';
        message.metadata = { fileUrl: messageData.media };
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message],
        isTyping: false,
      }));

      config.onMessage?.(message);
    }
  }, [config, getSessionId, state.sessionId, extractMessageType, processStreamStart, processDelta, processStreamEnd]);

  // Iniciar ping interval
  const startPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    
    pingIntervalRef.current = window.setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, pingInterval);
  }, []);

  // Parar ping interval
  const stopPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  // Enviar mensagem de registro
  const register = useCallback((ws: WebSocket, sessionId: string) => {
    const host = config.host || 'https://flows.weni.ai';
    const callback = `${host}/c/wwc/${config.channelUuid}/receive`;
    
    const registerMessage = {
      type: 'register',
      from: sessionId,
      callback,
      session_type: 'local', // ou 'session'
      token: config.sessionToken || undefined,
    };
    
    console.log('[WebChat] 📤 Enviando registro:', registerMessage);
    ws.send(JSON.stringify(registerMessage));
  }, [config.channelUuid, config.host, config.sessionToken]);

  // Conectar ao WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[WebChat] Já conectado');
      return;
    }

    // Fechar conexão anterior se existir
    if (wsRef.current) {
      wsRef.current.close();
    }

    console.log('[WebChat] 🔌 Iniciando conexão WebSocket...');
    console.log('[WebChat] Socket URL:', config.socketUrl);
    console.log('[WebChat] Channel UUID:', config.channelUuid);
    console.log('[WebChat] Host:', config.host);

    setConnectionStatus('connecting');
    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    isRegisteredRef.current = false;

    const sessionId = getSessionId();
    console.log('[WebChat] Session ID:', sessionId);

    // Construir URL do WebSocket - formato Weni
    const socketHost = config.socketUrl.replace(/^(https?:|)\/\//, '');
    const wsUrl = `wss://${socketHost}/ws`;
    
    console.log('[WebChat] Tentando URL:', wsUrl);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebChat] ✅ WebSocket conectado!');
        reconnectAttemptsRef.current = 0;
        
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          sessionId,
        }));
        
        // Enviar registro
        register(ws, sessionId);
        
        // Iniciar ping
        startPingInterval();
        
        setConnectionStatus('connected');
        config.onConnect?.();
      };

      ws.onclose = (event) => {
        console.log('[WebChat] ❌ WebSocket fechado:', event.code, event.reason);
        stopPingInterval();
        isRegisteredRef.current = false;
        
        setConnectionStatus('disconnected');
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));
        config.onDisconnect?.();

        // Tentar reconectar se não foi fechamento intencional
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          console.log(`[WebChat] Reconectando em ${delay}ms... (tentativa ${reconnectAttemptsRef.current + 1})`);
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebChat] ⚠️ Erro WebSocket:', error);
        setConnectionStatus('error');
        setState(prev => ({
          ...prev,
          isConnecting: false,
          error: new Error('Erro de conexão WebSocket'),
        }));
        config.onError?.(new Error('Erro de conexão WebSocket'));
      };

      ws.onmessage = (event) => {
        console.log('[WebChat] 📩 Mensagem recebida:', event.data);
        
        try {
          const data = JSON.parse(event.data);
          handleServerMessage(data);
        } catch (e) {
          console.log('[WebChat] Mensagem não-JSON:', event.data);
        }
      };

    } catch (error) {
      console.error('[WebChat] Erro ao criar WebSocket:', error);
      setConnectionStatus('error');
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
      }));
    }
  }, [config, getSessionId, handleServerMessage, register, startPingInterval, stopPingInterval]);

  // Desconectar
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    stopPingInterval();
    
    if (wsRef.current) {
      console.log('[WebChat] Desconectando...');
      wsRef.current.close(1000, 'User disconnect');
      wsRef.current = null;
    }
    
    reconnectAttemptsRef.current = 0;
    isRegisteredRef.current = false;
    setConnectionStatus('disconnected');
    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
    }));
  }, [stopPingInterval]);

  // Enviar mensagem
  const sendMessage = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('[WebChat] Não conectado');
      return;
    }

    if (!isRegisteredRef.current) {
      console.error('[WebChat] Ainda não registrado no servidor');
      return;
    }

    const sessionId = state.sessionId || getSessionId();

    const message: Message = {
      id: uuidv4(),
      text,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    // Adiciona a mensagem do usuário E ativa o indicador de typing instantaneamente
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      isTyping: true, // Mostrar typing imediatamente ao enviar
    }));

    // Formato de mensagem do Weni
    const payload = {
      type: 'message',
      message: {
        type: 'text',
        text,
      },
      context: '',
      from: sessionId,
    };

    console.log('[WebChat] 📤 Enviando:', payload);
    wsRef.current.send(JSON.stringify(payload));
  }, [getSessionId, state.sessionId]);

  // Enviar quick reply
  const sendQuickReply = useCallback((payload: string, title: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('[WebChat] Não conectado');
      return;
    }

    const sessionId = state.sessionId || getSessionId();

    const message: Message = {
      id: uuidv4(),
      text: title,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    // Adiciona a mensagem do usuário E ativa o indicador de typing instantaneamente
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      isTyping: true, // Mostrar typing imediatamente ao enviar
    }));

    const payloadMessage = {
      type: 'message',
      message: {
        type: 'text',
        text: payload,
      },
      context: '',
      from: sessionId,
    };

    console.log('[WebChat] 📤 Enviando quick reply:', payloadMessage);
    wsRef.current.send(JSON.stringify(payloadMessage));
  }, [getSessionId, state.sessionId]);

  // Limpar mensagens
  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }));
  }, []);

  // Definir campo customizado
  const setCustomField = useCallback((field: string, value: unknown) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    
    const sessionId = state.sessionId || getSessionId();
    
    wsRef.current.send(JSON.stringify({
      type: 'set_custom_field',
      data: {
        key: field,
        value,
      },
      from: sessionId,
    }));
  }, [getSessionId, state.sessionId]);

  // Definir contexto
  const setContext = useCallback((context: Record<string, unknown>) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    
    // Context é passado junto com as mensagens no Weni
    console.log('[WebChat] Context será enviado com próxima mensagem:', context);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ...state,
    connectionStatus,
    connect,
    disconnect,
    sendMessage,
    sendQuickReply,
    clearMessages,
    setCustomField,
    setContext,
  };
}
