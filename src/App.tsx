import { useState } from 'react';
import { ChatWidget } from './components';
import type { WebChatConfig } from './types';
import { MessageCircle, Zap, Palette, Shield, Code, Type, Link2, Image, Sun, Moon, Download, Upload, X } from 'lucide-react';

type ConfigTab = 'connection' | 'appearance' | 'texts';
type ThemeMode = 'dark' | 'light';

function App() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('appearance');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  
  // Configuração do chat
  const [config, setConfig] = useState<WebChatConfig>({
    // Configurações de conexão
    channelUuid: '81310c47-8520-40bf-a8a2-281bd495b7ba',
    socketUrl: 'https://websocket.weni.ai',
    host: 'https://flows.weni.ai',

    // Configurações de aparência
    title: 'WebChat Custom',
    subtitle: 'Desenvolvido com ❤️',
    avatarUrl: '',
    inputPlaceholder: 'Digite sua mensagem...',
    welcomeMessage: 'Olá! Como posso ajudar você hoje?',

    // Cores do tema
    primaryColor: '#6366f1',
    secondaryColor: '#818cf8',
    backgroundColor: '#0f0f23',
    textColor: '#e2e8f0',
    userMessageColor: '#6366f1',
    botMessageColor: '#1e1e3f',
    headerColor: '#6366f1',
    footerColor: '#1e1e3f',
    
    // Cores de texto
    textHeaderColor: '#ffffff',
    textInputColor: '#e2e8f0',
    textPlaceholderColor: '#94a3b8',
    textUserMessageColor: '#ffffff',
    textBotMessageColor: '#e2e8f0',

    // Callbacks
    onConnect: () => console.log('✅ Conectado ao WebChat'),
    onDisconnect: () => console.log('❌ Desconectado do WebChat'),
    onMessage: (msg) => console.log('📨 Nova mensagem:', msg),
    onError: (err) => console.error('⚠️ Erro:', err),
  });

  const updateConfig = (key: keyof WebChatConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Upload de avatar com compressão
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem válido.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          const MAX_SIZE = 150;
          const QUALITY = 0.8;
          
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', QUALITY);
            updateConfig('avatarUrl', compressedDataUrl);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    updateConfig('avatarUrl', '');
  };

  // Presets de cores com versões dark e light
  const colorPresets = {
    dark: [
      { name: 'Indigo', primary: '#6366f1', secondary: '#818cf8', bg: '#0f0f23', botBubble: '#1e1e3f', header: '#6366f1', footer: '#1e1e3f', textHeader: '#ffffff', textUser: '#ffffff', textBot: '#e2e8f0', textInput: '#e2e8f0', textPlaceholder: '#94a3b8' },
      { name: 'Emerald', primary: '#10b981', secondary: '#34d399', bg: '#0f1f1a', botBubble: '#1a2f2a', header: '#10b981', footer: '#1a2f2a', textHeader: '#ffffff', textUser: '#ffffff', textBot: '#e2e8f0', textInput: '#e2e8f0', textPlaceholder: '#94a3b8' },
      { name: 'Rose', primary: '#f43f5e', secondary: '#fb7185', bg: '#1f0f14', botBubble: '#2f1a22', header: '#f43f5e', footer: '#2f1a22', textHeader: '#ffffff', textUser: '#ffffff', textBot: '#e2e8f0', textInput: '#e2e8f0', textPlaceholder: '#94a3b8' },
      { name: 'Amber', primary: '#f59e0b', secondary: '#fbbf24', bg: '#1f1a0f', botBubble: '#2f2a1a', header: '#f59e0b', footer: '#2f2a1a', textHeader: '#ffffff', textUser: '#ffffff', textBot: '#e2e8f0', textInput: '#e2e8f0', textPlaceholder: '#94a3b8' },
      { name: 'Cyan', primary: '#06b6d4', secondary: '#22d3ee', bg: '#0f1a1f', botBubble: '#1a2a2f', header: '#06b6d4', footer: '#1a2a2f', textHeader: '#ffffff', textUser: '#ffffff', textBot: '#e2e8f0', textInput: '#e2e8f0', textPlaceholder: '#94a3b8' },
      { name: 'Purple', primary: '#a855f7', secondary: '#c084fc', bg: '#1a0f23', botBubble: '#2a1e3f', header: '#a855f7', footer: '#2a1e3f', textHeader: '#ffffff', textUser: '#ffffff', textBot: '#e2e8f0', textInput: '#e2e8f0', textPlaceholder: '#94a3b8' },
    ],
    light: [
      { name: 'Indigo', primary: '#6366f1', secondary: '#818cf8', bg: '#ffffff', botBubble: '#f1f5f9', header: '#6366f1', footer: '#f8fafc', textHeader: '#ffffff', textUser: '#ffffff', textBot: '#1e293b', textInput: '#1e293b', textPlaceholder: '#94a3b8' },
      { name: 'Emerald', primary: '#10b981', secondary: '#34d399', bg: '#ffffff', botBubble: '#ecfdf5', header: '#10b981', footer: '#f8fafc', textHeader: '#ffffff', textUser: '#ffffff', textBot: '#1e293b', textInput: '#1e293b', textPlaceholder: '#94a3b8' },
      { name: 'Rose', primary: '#f43f5e', secondary: '#fb7185', bg: '#ffffff', botBubble: '#fff1f2', header: '#f43f5e', footer: '#f8fafc', textHeader: '#ffffff', textUser: '#ffffff', textBot: '#1e293b', textInput: '#1e293b', textPlaceholder: '#94a3b8' },
      { name: 'Amber', primary: '#f59e0b', secondary: '#fbbf24', bg: '#ffffff', botBubble: '#fffbeb', header: '#f59e0b', footer: '#f8fafc', textHeader: '#1e293b', textUser: '#1e293b', textBot: '#1e293b', textInput: '#1e293b', textPlaceholder: '#94a3b8' },
      { name: 'Cyan', primary: '#06b6d4', secondary: '#22d3ee', bg: '#ffffff', botBubble: '#ecfeff', header: '#06b6d4', footer: '#f8fafc', textHeader: '#ffffff', textUser: '#ffffff', textBot: '#1e293b', textInput: '#1e293b', textPlaceholder: '#94a3b8' },
      { name: 'Purple', primary: '#a855f7', secondary: '#c084fc', bg: '#ffffff', botBubble: '#faf5ff', header: '#a855f7', footer: '#f8fafc', textHeader: '#ffffff', textUser: '#ffffff', textBot: '#1e293b', textInput: '#1e293b', textPlaceholder: '#94a3b8' },
    ],
  };

  const currentPresets = colorPresets[themeMode];

  const applyPreset = (preset: typeof currentPresets[0]) => {
    setConfig(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      backgroundColor: preset.bg,
      userMessageColor: preset.primary,
      botMessageColor: preset.botBubble,
      headerColor: preset.header,
      footerColor: preset.footer,
      textHeaderColor: preset.textHeader,
      textUserMessageColor: preset.textUser,
      textBotMessageColor: preset.textBot,
      textInputColor: preset.textInput,
      textPlaceholderColor: preset.textPlaceholder,
    }));
  };

  const toggleThemeMode = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
    // Aplica o primeiro preset do novo modo automaticamente
    const firstPreset = colorPresets[newMode][0];
    applyPreset(firstPreset);
  };

  // Gera o HTML de exemplo para download
  const generateExampleHTML = () => {
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebChat - ${config.title || 'Chat'}</title>
  
  <!-- CSS do WebChat Widget -->
  <link rel="stylesheet" href="webchat-widget.css">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      background: ${themeMode === 'light' ? '#f5f5f5' : '#1a1a2e'};
      color: ${themeMode === 'light' ? '#333' : '#e2e8f0'};
    }
    .page-content {
      padding: 40px 20px;
      max-width: 900px;
      margin: 0 auto;
    }
    h1 { margin-bottom: 16px; }
    h2 { margin-top: 30px; margin-bottom: 16px; font-size: 1.4em; }
    p { line-height: 1.6; opacity: 0.8; margin-bottom: 12px; }
    .info-box {
      margin-top: 20px;
      padding: 20px;
      background: ${themeMode === 'light' ? '#e8f5e9' : '#1e3a2f'};
      border-radius: 12px;
      border-left: 4px solid #10b981;
    }
    .info-box h3 { color: #10b981; margin-bottom: 10px; }
    .info-box p { margin-bottom: 8px; }
    .code-box {
      margin-top: 20px;
      padding: 20px;
      background: ${themeMode === 'light' ? '#fff3e0' : '#2d2a1f'};
      border-radius: 12px;
      border-left: 4px solid #f59e0b;
    }
    .code-box h3 { color: #f59e0b; margin-bottom: 10px; }
    .code-container {
      position: relative;
      margin-top: 12px;
    }
    .code-block {
      display: block;
      background: ${themeMode === 'light' ? '#1e1e2e' : '#0d0d1a'};
      color: #e2e8f0;
      padding: 16px;
      border-radius: 8px;
      font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      line-height: 1.5;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .copy-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 8px 16px;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .copy-btn:hover { background: #059669; }
    .copy-btn.copied { background: #6366f1; }
    .steps-list {
      margin: 16px 0;
      padding-left: 0;
      list-style: none;
    }
    .steps-list li {
      padding: 12px 16px;
      margin-bottom: 8px;
      background: ${themeMode === 'light' ? '#f0f0f0' : '#252540'};
      border-radius: 8px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .step-number {
      background: #6366f1;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      flex-shrink: 0;
    }
    .divider {
      height: 1px;
      background: ${themeMode === 'light' ? '#ddd' : '#333'};
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <!-- Conteúdo da sua página -->
  <div class="page-content">
    <h1>🎉 WebChat Configurado com Sucesso!</h1>
    <p>O widget do chat está aparecendo no canto inferior direito desta página. Clique nele para testar!</p>
    
    <div class="info-box">
      <h3>📁 Arquivos do Widget</h3>
      <p>Esta pasta contém 3 arquivos necessários para o funcionamento:</p>
      <ul class="steps-list">
        <li><span class="step-number">1</span> <strong>index.html</strong> - Esta página de teste</li>
        <li><span class="step-number">2</span> <strong>webchat-widget.css</strong> - Estilos do chat</li>
        <li><span class="step-number">3</span> <strong>webchat-widget.iife.js</strong> - Script do chat</li>
      </ul>
    </div>

    <div class="divider"></div>

    <h2>🚀 Como integrar no seu site</h2>
    <p>Siga os passos abaixo para adicionar o chat ao seu site:</p>
    
    <ul class="steps-list">
      <li><span class="step-number">1</span> Faça upload dos arquivos <strong>webchat-widget.css</strong> e <strong>webchat-widget.iife.js</strong> para o servidor do seu site</li>
      <li><span class="step-number">2</span> Copie o código abaixo clicando no botão "Copiar código"</li>
      <li><span class="step-number">3</span> Cole o código antes do fechamento da tag <strong>&lt;/body&gt;</strong> no HTML do seu site</li>
      <li><span class="step-number">4</span> Ajuste os caminhos dos arquivos CSS e JS se necessário</li>
    </ul>

    <div class="code-box">
      <h3>📋 Código para copiar</h3>
      <p>Cole este código no HTML do seu site:</p>
      <div class="code-container">
        <button class="copy-btn" onclick="copyCode()">📋 Copiar código</button>
        <pre class="code-block" id="code-to-copy">&lt;!-- WebChat Widget - CSS --&gt;
&lt;link rel="stylesheet" href="webchat-widget.css"&gt;

&lt;!-- WebChat Widget - Configuração --&gt;
&lt;script&gt;
window.WEBCHAT_CONFIG = {
  channelUuid: '${config.channelUuid}',
  socketUrl: '${config.socketUrl}',
  host: '${config.host}',
  title: '${config.title || 'Chat'}',
  subtitle: '${config.subtitle || ''}',
  inputPlaceholder: '${config.inputPlaceholder || 'Digite sua mensagem...'}',
  welcomeMessage: '${config.welcomeMessage || 'Olá! Como posso ajudar você hoje?'}',${config.avatarUrl ? `
  avatarUrl: '${config.avatarUrl}',` : ''}
  primaryColor: '${config.primaryColor}',
  secondaryColor: '${config.secondaryColor}',
  backgroundColor: '${config.backgroundColor}',
  userMessageColor: '${config.userMessageColor}',
  botMessageColor: '${config.botMessageColor}',
  headerColor: '${config.headerColor}',
  footerColor: '${config.footerColor}',
  textHeaderColor: '${config.textHeaderColor}',
  textUserMessageColor: '${config.textUserMessageColor}',
  textBotMessageColor: '${config.textBotMessageColor}',
  textInputColor: '${config.textInputColor}',
  textPlaceholderColor: '${config.textPlaceholderColor}'
};
&lt;/script&gt;

&lt;!-- WebChat Widget - Script --&gt;
&lt;script src="webchat-widget.iife.js"&gt;&lt;/script&gt;</pre>
      </div>
    </div>
  </div>

  <script>
    function copyCode() {
      const codeElement = document.getElementById('code-to-copy');
      const code = codeElement.innerText
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      
      navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.textContent = '✅ Copiado!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = '📋 Copiar código';
          btn.classList.remove('copied');
        }, 2000);
      });
    }
  </script>

  <!-- Configuração do WebChat -->
  <script>
    window.WEBCHAT_CONFIG = {
      // Conexão
      channelUuid: '${config.channelUuid}',
      socketUrl: '${config.socketUrl}',
      host: '${config.host}',
      
      // Textos
      title: '${config.title || 'Chat'}',
      subtitle: '${config.subtitle || ''}',
      inputPlaceholder: '${config.inputPlaceholder || 'Digite sua mensagem...'}',
      welcomeMessage: '${config.welcomeMessage || 'Olá! Como posso ajudar você hoje?'}',
      ${config.avatarUrl ? `avatarUrl: '${config.avatarUrl}',` : ''}
      
      // Cores - Componentes
      primaryColor: '${config.primaryColor}',
      secondaryColor: '${config.secondaryColor}',
      backgroundColor: '${config.backgroundColor}',
      userMessageColor: '${config.userMessageColor}',
      botMessageColor: '${config.botMessageColor}',
      headerColor: '${config.headerColor}',
      footerColor: '${config.footerColor}',
      
      // Cores - Textos
      textHeaderColor: '${config.textHeaderColor}',
      textUserMessageColor: '${config.textUserMessageColor}',
      textBotMessageColor: '${config.textBotMessageColor}',
      textInputColor: '${config.textInputColor}',
      textPlaceholderColor: '${config.textPlaceholderColor}',
    };
  </script>

  <!-- Script do WebChat Widget -->
  <script src="webchat-widget.iife.js"></script>
</body>
</html>`;

    // Cria o arquivo e faz o download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return html; // Retorna o HTML para uso em downloadAllFiles
  };

  // Função para baixar todos os 3 arquivos de uma vez
  const downloadAllFiles = async () => {
    try {
      // 1. Baixar o HTML
      generateExampleHTML();
      
      // Pequeno delay entre downloads para evitar bloqueio do navegador
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 2. Baixar o CSS
      const cssResponse = await fetch('/widget/webchat-widget.css');
      const cssContent = await cssResponse.text();
      const cssBlob = new Blob([cssContent], { type: 'text/css' });
      const cssUrl = URL.createObjectURL(cssBlob);
      const cssLink = document.createElement('a');
      cssLink.href = cssUrl;
      cssLink.download = 'webchat-widget.css';
      document.body.appendChild(cssLink);
      cssLink.click();
      document.body.removeChild(cssLink);
      URL.revokeObjectURL(cssUrl);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 3. Baixar o JS
      const jsResponse = await fetch('/widget/webchat-widget.iife.js');
      const jsContent = await jsResponse.text();
      const jsBlob = new Blob([jsContent], { type: 'application/javascript' });
      const jsUrl = URL.createObjectURL(jsBlob);
      const jsLink = document.createElement('a');
      jsLink.href = jsUrl;
      jsLink.download = 'webchat-widget.iife.js';
      document.body.appendChild(jsLink);
      jsLink.click();
      document.body.removeChild(jsLink);
      URL.revokeObjectURL(jsUrl);
      
    } catch (error) {
      console.error('Erro ao baixar arquivos:', error);
      alert('Erro ao baixar os arquivos. Tente novamente.');
    }
  };

  // Função para baixar todos os arquivos do widget como ZIP
  const downloadWidgetFiles = async () => {
    // Abre uma janela de instruções
    const instructions = `
📦 INSTRUÇÕES DE DOWNLOAD

Para integrar o WebChat no seu site, você precisa de 3 arquivos:

1. index.html (já baixado ao clicar em "Baixar HTML de exemplo")
2. webchat-widget.css
3. webchat-widget.iife.js

Os arquivos do widget estão na pasta:
dist/widget/

Copie os arquivos para o seu servidor e coloque todos na mesma pasta.

Estrutura final:
├── index.html
├── webchat-widget.css
└── webchat-widget.iife.js
    `.trim();
    
    alert(instructions);
  };

  return (
    <div className="demo-page">
      {/* Painel de configuração */}
      <div className="config-panel">
        <h3>Personalização</h3>
        
        {/* Abas */}
        <div className="config-tabs">
          <button 
            className={`config-tab ${activeTab === 'connection' ? 'config-tab--active' : ''}`}
            onClick={() => setActiveTab('connection')}
          >
            <Link2 size={14} />
            <span>Conexão</span>
          </button>
          <button 
            className={`config-tab ${activeTab === 'appearance' ? 'config-tab--active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <Palette size={14} />
            <span>Aparência</span>
          </button>
          <button 
            className={`config-tab ${activeTab === 'texts' ? 'config-tab--active' : ''}`}
            onClick={() => setActiveTab('texts')}
          >
            <Type size={14} />
            <span>Textos</span>
          </button>
        </div>

        {/* Conteúdo das abas */}
        <div className="config-content">
          {/* Aba Conexão */}
          {activeTab === 'connection' && (
            <>
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

              <p className="config-note">
                💡 Obtenha seu Channel UUID no painel do Weni ao criar um canal WebChat.
              </p>
            </>
          )}

          {/* Aba Aparência */}
          {activeTab === 'appearance' && (
            <>
              {/* Switch Modo Claro/Escuro */}
              <div className="config-section">
                <div className="theme-mode-toggle">
                  <span className={`theme-mode-label ${themeMode === 'light' ? 'active' : ''}`}>
                    <Sun size={16} /> Dia
                  </span>
                  <button 
                    className={`theme-mode-switch ${themeMode}`}
                    onClick={toggleThemeMode}
                    aria-label="Alternar modo claro/escuro"
                  >
                    <span className="theme-mode-switch-thumb" />
                  </button>
                  <span className={`theme-mode-label ${themeMode === 'dark' ? 'active' : ''}`}>
                    <Moon size={16} /> Noite
                  </span>
                </div>
              </div>

              {/* Presets de cores */}
              <div className="config-section">
                <label className="config-section-label">Temas prontos</label>
                <div className="color-presets">
                  {currentPresets.map((preset) => (
                    <button
                      key={preset.name}
                      className="color-preset"
                      onClick={() => applyPreset(preset)}
                      title={preset.name}
                    >
                      <span 
                        className="color-preset-swatch"
                        style={{ background: preset.primary }}
                      />
                      <span className="color-preset-name">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cores customizadas */}
              <div className="config-section">
                <label className="config-section-label">Cores personalizadas</label>
                
                <div className="color-grid">
                  <div className="color-field">
                    <label>Cor primária</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => updateConfig('primaryColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={config.primaryColor}
                        onChange={(e) => updateConfig('primaryColor', e.target.value)}
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>

                  <div className="color-field">
                    <label>Cor secundária</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={config.secondaryColor}
                        onChange={(e) => updateConfig('secondaryColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={config.secondaryColor}
                        onChange={(e) => updateConfig('secondaryColor', e.target.value)}
                        placeholder="#818cf8"
                      />
                    </div>
                  </div>

                  <div className="color-field">
                    <label>Fundo</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={config.backgroundColor}
                        onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={config.backgroundColor}
                        onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                        placeholder="#0f0f23"
                      />
                    </div>
                  </div>

                  <div className="color-field">
                    <label>Mensagem usuário</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={config.userMessageColor}
                        onChange={(e) => updateConfig('userMessageColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={config.userMessageColor}
                        onChange={(e) => updateConfig('userMessageColor', e.target.value)}
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>

                  <div className="color-field">
                    <label>Mensagem bot</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={config.botMessageColor}
                        onChange={(e) => updateConfig('botMessageColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={config.botMessageColor}
                        onChange={(e) => updateConfig('botMessageColor', e.target.value)}
                        placeholder="#1e1e3f"
                      />
                    </div>
                  </div>

                  <div className="color-field">
                    <label>Topo (header)</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={config.headerColor}
                        onChange={(e) => updateConfig('headerColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={config.headerColor}
                        onChange={(e) => updateConfig('headerColor', e.target.value)}
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>

                  <div className="color-field">
                    <label>Rodapé (input)</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={config.footerColor}
                        onChange={(e) => updateConfig('footerColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={config.footerColor}
                        onChange={(e) => updateConfig('footerColor', e.target.value)}
                        placeholder="#1e1e3f"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cores de Texto */}
              <div className="config-section">
                <label className="config-section-label">
                  <Type size={14} />
                  Cores de Texto
                </label>
                
                <div className="color-grid">
                  <div className="color-field">
                    <label>Texto header</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={config.textHeaderColor}
                        onChange={(e) => updateConfig('textHeaderColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={config.textHeaderColor}
                        onChange={(e) => updateConfig('textHeaderColor', e.target.value)}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div className="color-field">
                    <label>Texto mensagem usuário</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={config.textUserMessageColor}
                        onChange={(e) => updateConfig('textUserMessageColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={config.textUserMessageColor}
                        onChange={(e) => updateConfig('textUserMessageColor', e.target.value)}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div className="color-field">
                    <label>Texto mensagem bot</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={config.textBotMessageColor}
                        onChange={(e) => updateConfig('textBotMessageColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={config.textBotMessageColor}
                        onChange={(e) => updateConfig('textBotMessageColor', e.target.value)}
                        placeholder="#e2e8f0"
                      />
                    </div>
                  </div>

                  <div className="color-field">
                    <label>Texto input</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={config.textInputColor}
                        onChange={(e) => updateConfig('textInputColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={config.textInputColor}
                        onChange={(e) => updateConfig('textInputColor', e.target.value)}
                        placeholder="#e2e8f0"
                      />
                    </div>
                  </div>

                  <div className="color-field">
                    <label>Placeholder</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={config.textPlaceholderColor}
                        onChange={(e) => updateConfig('textPlaceholderColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={config.textPlaceholderColor}
                        onChange={(e) => updateConfig('textPlaceholderColor', e.target.value)}
                        placeholder="#94a3b8"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Avatar/Logo */}
              <div className="config-section">
                <label className="config-section-label">
                  <Image size={14} />
                  Logo / Avatar
                </label>
                <label className="avatar-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="avatar-upload-input"
                  />
                  {config.avatarUrl ? (
                    <div className="avatar-preview">
                      <img src={config.avatarUrl} alt="Preview" />
                      <button 
                        type="button" 
                        className="avatar-remove-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          removeAvatar();
                        }}
                      >
                        <X size={14} />
                        Remover
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={32} className="avatar-upload-icon" />
                      <span className="avatar-upload-text">Clique para selecionar uma imagem</span>
                      <span className="avatar-upload-hint">PNG, JPG ou GIF</span>
                    </>
                  )}
                </label>
              </div>
            </>
          )}

          {/* Aba Textos */}
          {activeTab === 'texts' && (
            <>
              <div className="config-field">
                <label>Nome do agente</label>
                <input
                  type="text"
                  value={config.title || ''}
                  onChange={(e) => updateConfig('title', e.target.value)}
                  placeholder="Ex: Assistente Virtual"
                />
              </div>

              <div className="config-field">
                <label>Subtítulo</label>
                <input
                  type="text"
                  value={config.subtitle || ''}
                  onChange={(e) => updateConfig('subtitle', e.target.value)}
                  placeholder="Status ou descrição"
                />
              </div>

              <div className="config-field">
                <label>Mensagem de apresentação do chat</label>
                <input
                  type="text"
                  value={config.welcomeMessage || ''}
                  onChange={(e) => updateConfig('welcomeMessage', e.target.value)}
                  placeholder="Olá! Como posso ajudar você hoje?"
                />
              </div>

              <div className="config-field">
                <label>Placeholder do input</label>
                <input
                  type="text"
                  value={config.inputPlaceholder || ''}
                  onChange={(e) => updateConfig('inputPlaceholder', e.target.value)}
                  placeholder="Digite sua mensagem..."
                />
              </div>
            </>
          )}
        </div>

        {/* Botão de Download */}
        <div className="download-section">
          <button 
            className="download-button"
            onClick={downloadAllFiles}
          >
            <Download size={18} />
            <span>Baixar Widget (3 arquivos)</span>
          </button>
          
          <p className="download-hint">
            Serão baixados: index.html, webchat-widget.css e webchat-widget.iife.js
          </p>
          <p className="download-hint">
            Coloque os 3 arquivos na mesma pasta do seu site
          </p>
        </div>
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
