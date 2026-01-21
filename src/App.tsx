import React, { useState } from 'react';
import { ChatWidget } from './components';
import type { WebChatConfig } from './types';
import { MessageCircle, Zap, Palette, Shield, Code } from 'lucide-react';

function App() {
  // Configuração do chat - altere com suas credenciais do Weni
  const [config, setConfig] = useState<WebChatConfig>({
    // === CONFIGURAÇÕES OBRIGATÓRIAS ===
    // Substitua pelo seu channelUuid do painel do Weni
    channelUuid: '81310c47-8520-40bf-a8a2-281bd495b7ba',
    
    // URL do socket do Weni
    socketUrl: 'https://websocket.weni.ai',
    
    // Host do servidor de flows
    host: 'https://flows.weni.ai',

    // === CONFIGURAÇÕES OPCIONAIS ===
    title: 'WebChat Custom',
    subtitle: 'Desenvolvido com ❤️',
    inputPlaceholder: 'Digite sua mensagem...',
    
    // Mensagem inicial (opcional)
    // initPayload: 'oi',

    // Cores do tema (cyberpunk/neon por padrão)
    primaryColor: '#6366f1',
    secondaryColor: '#818cf8',
    backgroundColor: '#0f0f23',
    textColor: '#e2e8f0',
    userMessageColor: '#6366f1',
    botMessageColor: '#1e1e3f',

    // Callbacks
    onConnect: () => console.log('✅ Conectado ao WebChat'),
    onDisconnect: () => console.log('❌ Desconectado do WebChat'),
    onMessage: (msg) => console.log('📨 Nova mensagem:', msg),
    onError: (err) => console.error('⚠️ Erro:', err),
  });

  const updateConfig = (key: keyof WebChatConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="demo-page">
      {/* Painel de configuração para testes */}
      <div className="config-panel">
        <h3>Configurações</h3>
        
        <div className="config-field">
          <label>Channel UUID</label>
          <input
            type="text"
            value={config.channelUuid}
            onChange={(e) => updateConfig('channelUuid', e.target.value)}
            placeholder="Ex: abc123-def456-..."
          />
        </div>

        <div className="config-field">
          <label>Socket URL</label>
          <input
            type="text"
            value={config.socketUrl}
            onChange={(e) => updateConfig('socketUrl', e.target.value)}
            placeholder="Ex: https://websocket.weni.ai"
          />
        </div>

        <div className="config-field">
          <label>Host</label>
          <input
            type="text"
            value={config.host}
            onChange={(e) => updateConfig('host', e.target.value)}
            placeholder="Ex: https://flows.weni.ai"
          />
        </div>

        <div className="config-field">
          <label>Título</label>
          <input
            type="text"
            value={config.title || ''}
            onChange={(e) => updateConfig('title', e.target.value)}
            placeholder="Nome do chat"
          />
        </div>

        <p className="config-note">
          💡 Obtenha seu Channel UUID no painel do Weni ao criar um canal WebChat.
        </p>
      </div>

      {/* Conteúdo da demo */}
      <div className="demo-content">
        <span className="demo-badge">Open Source</span>
        
        <h1 className="demo-title">
          WebChat Custom
        </h1>
        
        <p className="demo-description">
          Seu próprio webchat inspirado no Weni WebChat React. 
          Conecte-se ao socket do Weni com total controle sobre a UI e experiência.
        </p>

        <div className="demo-features">
          <div className="demo-feature">
            <MessageCircle size={16} className="demo-feature-icon" />
            <span>Socket.IO</span>
          </div>
          <div className="demo-feature">
            <Zap size={16} className="demo-feature-icon" />
            <span>Real-time</span>
          </div>
          <div className="demo-feature">
            <Palette size={16} className="demo-feature-icon" />
            <span>Customizável</span>
          </div>
          <div className="demo-feature">
            <Shield size={16} className="demo-feature-icon" />
            <span>TypeScript</span>
          </div>
          <div className="demo-feature">
            <Code size={16} className="demo-feature-icon" />
            <span>React 18</span>
          </div>
        </div>

        <p className="demo-hint">
          Clique no botão <span>💬</span> no canto inferior direito para testar
        </p>
      </div>

      {/* Widget do Chat */}
      <ChatWidget 
        config={config}
        autoConnect={false}
        startOpen={false}
      />
    </div>
  );
}

export default App;
