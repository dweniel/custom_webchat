# WebChat Custom

Um webchat customizado inspirado no [Weni WebChat React](https://github.com/weni-ai/webchat-react), com total controle sobre a UI e conexão com o socket do Weni.

## 🚀 Recursos

- ✅ Conexão via Socket.IO com o servidor do Weni
- ✅ UI moderna com tema Cyberpunk/Neon
- ✅ Totalmente customizável via CSS variables
- ✅ TypeScript com tipos completos
- ✅ React 18 com hooks modernos
- ✅ Animações suaves com Framer Motion
- ✅ Suporte a Quick Replies, Carrosséis e Anexos
- ✅ Indicador de digitação
- ✅ Reconexão automática
- ✅ Persistência de sessão

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

## ⚙️ Configuração

Para conectar ao Weni, você precisa de:

1. **Channel UUID**: Obtido ao criar um canal WebChat no painel do Weni
2. **Socket URL**: `https://websocket.weni.ai` (padrão)
3. **Host**: `https://flows.weni.ai` (padrão)

### Exemplo de uso:

```tsx
import { ChatWidget } from './components';
import type { WebChatConfig } from './types';

const config: WebChatConfig = {
  // Obrigatórios
  channelUuid: 'SEU-CHANNEL-UUID',
  socketUrl: 'https://websocket.weni.ai',
  host: 'https://flows.weni.ai',
  
  // Opcionais
  title: 'Meu Chat',
  subtitle: 'Online',
  initPayload: 'oi', // Mensagem inicial
  
  // Customização visual
  primaryColor: '#6366f1',
  backgroundColor: '#0f0f23',
  
  // Callbacks
  onConnect: () => console.log('Conectado!'),
  onMessage: (msg) => console.log('Mensagem:', msg),
};

function App() {
  return (
    <ChatWidget 
      config={config}
      autoConnect={true}
      startOpen={false}
    />
  );
}
```

## 🎨 Customização

### Props do ChatWidget

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `config` | `WebChatConfig` | - | Configuração do chat |
| `autoConnect` | `boolean` | `true` | Conectar automaticamente ao abrir |
| `startOpen` | `boolean` | `false` | Iniciar com o chat aberto |

### Opções de Configuração

```typescript
interface WebChatConfig {
  // Conexão (obrigatórios)
  socketUrl: string;
  host: string;
  channelUuid: string;
  
  // Sessão
  initPayload?: string;
  sessionToken?: string;
  sessionId?: string;
  customData?: Record<string, unknown>;
  
  // UI
  title?: string;
  subtitle?: string;
  avatarUrl?: string;
  inputPlaceholder?: string;
  
  // Tema
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  userMessageColor?: string;
  botMessageColor?: string;
  
  // Callbacks
  onMessage?: (message: Message) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}
```

### CSS Variables

Você pode customizar o visual sobrescrevendo as CSS variables:

```css
:root {
  --chat-primary: #6366f1;
  --chat-secondary: #818cf8;
  --chat-background: #0f0f23;
  --chat-surface: #1a1a35;
  --chat-text: #e2e8f0;
  --chat-user-bubble: #6366f1;
  --chat-bot-bubble: #1e1e3f;
  --chat-border: rgba(99, 102, 241, 0.2);
  --chat-radius: 16px;
}
```

## 🔌 Hook useWeniSocket

Para uso avançado, você pode usar o hook diretamente:

```tsx
import { useWeniSocket } from './hooks/useWeniSocket';

function MyCustomChat() {
  const {
    messages,
    isConnected,
    isTyping,
    connect,
    disconnect,
    sendMessage,
    sendQuickReply,
    setCustomField,
    setContext,
  } = useWeniSocket(config);

  return (
    // Sua UI customizada
  );
}
```

## 📡 Eventos do Socket

O hook escuta os seguintes eventos do servidor:

- `connect` - Conexão estabelecida
- `disconnect` - Desconectado
- `bot_message` - Mensagem do bot
- `typing` - Bot está digitando
- `session_start` - Sessão iniciada

E emite:

- `user_message` - Mensagem do usuário
- `set_custom_field` - Definir campo customizado
- `set_context` - Definir contexto

## ⚠️ Notas Importantes

1. **Autenticação**: O Weni pode exigir autenticação adicional. Verifique a documentação oficial.

2. **CORS**: Se tiver problemas de CORS, pode ser necessário configurar no servidor ou usar um proxy.

3. **Termos de Uso**: Certifique-se de ter autorização para usar o socket do Weni.

4. **Protocolo**: O formato das mensagens pode variar. Inspecione o tráfego no DevTools para ajustar.

## 🛠️ Estrutura do Projeto

```
src/
├── components/
│   ├── ChatWidget.tsx      # Widget principal
│   ├── ChatHeader.tsx      # Cabeçalho
│   ├── ChatMessages.tsx    # Lista de mensagens
│   ├── ChatInput.tsx       # Campo de entrada
│   ├── MessageBubble.tsx   # Bolha de mensagem
│   ├── QuickReplies.tsx    # Quick replies
│   ├── TypingIndicator.tsx # Indicador de digitação
│   └── ChatWidget.css      # Estilos
├── context/
│   └── ChatContext.tsx     # Context do React
├── hooks/
│   └── useWeniSocket.ts    # Hook de conexão
├── types/
│   └── index.ts            # Tipos TypeScript
├── styles/
│   └── global.css          # Estilos globais
├── App.tsx                 # Aplicação demo
└── main.tsx                # Entrada
```

## 📄 Licença

MIT

## 🤝 Contribuições

Contribuições são bem-vindas! Abra uma issue ou PR.
