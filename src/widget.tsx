import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChatWidget } from './components';
import type { WebChatConfig } from './types';

// Declara a interface global para as configurações
declare global {
  interface Window {
    WEBCHAT_CONFIG?: WebChatConfig;
    WebChatWidget?: {
      init: (config: WebChatConfig) => void;
    };
  }
}

// Função para inicializar o widget
function initWidget(config: WebChatConfig) {
  // Cria o container se não existir
  let container = document.getElementById('webchat-widget-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'webchat-widget-root';
    document.body.appendChild(container);
  }

  // Renderiza o widget
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ChatWidget 
        config={config}
        autoConnect={true}
        startOpen={false}
      />
    </React.StrictMode>
  );
}

// Auto-inicializa se WEBCHAT_CONFIG estiver definido
if (typeof window !== 'undefined') {
  // Expõe a API global
  window.WebChatWidget = {
    init: initWidget
  };

  // Auto-init quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.WEBCHAT_CONFIG) {
        initWidget(window.WEBCHAT_CONFIG);
      }
    });
  } else {
    // DOM já carregado
    if (window.WEBCHAT_CONFIG) {
      initWidget(window.WEBCHAT_CONFIG);
    }
  }
}

export { initWidget };
