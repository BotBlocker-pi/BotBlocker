/**
 * Ponto de entrada principal da extensão
 */
import { detectCurrentPlatform } from './modules/platform-detector';
import { fetchPerfis } from './modules/api-client';
import { addGlobalStyles } from './utils/dom-helpers';
import { logInfo } from './utils/logging';
import { setupUrlChangeMonitor, setupMessageListeners } from './modules/ui-manager';
import { PLATFORMS } from './constants';

// Importações específicas de plataformas
import { 
    collectMentionsTwitter, 
    blockProfileTwitter,
    unblockLoading as unblockLoadingTwitter
} from './platforms/twitter';

import { 
    collectMentionsInstagram, 
    blockProfileInstagram 
} from './platforms/instagram';

// Inicialização única no carregamento
function initialize() {
    // Carregar perfis da API
    fetchPerfis().then(() => {
        logInfo('Perfis carregados da API');
        
        // Detectar plataforma atual e inicializar apropriadamente
        detectPlatformAndInitialize();
    });
    
    // Adicionar estilos globais
    addGlobalStyles();
    
    // Configurar listeners de mensagens do popup
    setupMessageHandlers();
}

// Detectar plataforma e inicializar scripts apropriados
function detectPlatformAndInitialize() {
    const platform = detectCurrentPlatform();
    
    switch (platform) {
        case PLATFORMS.TWITTER:
            logInfo('Inicializando scripts do Twitter');
            initializeTwitter();
            break;
            
        case PLATFORMS.INSTAGRAM:
            logInfo('Inicializando scripts do Instagram');
            initializeInstagram();
            break;
            
        default:
            logInfo('Plataforma não suportada');
    }
}

// Inicializar scripts para Twitter
function initializeTwitter() {
    // Coletar menções iniciais
    collectMentionsTwitter();
    
    // Configurar observer para mudanças na DOM
    const pageObserver = new MutationObserver(() => {
        collectMentionsTwitter();
    });
    
    // Observar mudanças no DOM
    pageObserver.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
}

// Inicializar scripts para Instagram
function initializeInstagram() {
    // Coletar menções iniciais
    collectMentionsInstagram();
    
    // Configurar observer para mudanças na DOM
    const pageObserver = new MutationObserver(() => {
        collectMentionsInstagram();
    });
    
    // Observar mudanças no DOM
    pageObserver.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
}

// Configurar handlers para mensagens do popup
function setupMessageHandlers() {
    setupMessageListeners({
        getCurrentProfile: () => {
            const platform = detectCurrentPlatform();
            let profileName = null;
            
            switch (platform) {
                case PLATFORMS.TWITTER:
                    profileName = window.location.pathname.split("/")[1];
                    break;
                    
                case PLATFORMS.INSTAGRAM:
                    const pathname = window.location.pathname;
                    if (pathname.startsWith('/') && pathname.length > 1) {
                        profileName = pathname.substring(1).split('/')[0];
                    }
                    break;
            }
            
            return {
                url: window.location.href,
                profile: profileName,
                platform: platform
            };
        },
        
        blockProfileManually: (username, platform) => {
            logInfo(`Manual block request for profile: ${username} on ${platform}`);
            
            if (platform === PLATFORMS.TWITTER) {
                blockProfileTwitter(username);
            } else if (platform === PLATFORMS.INSTAGRAM) {
                blockProfileInstagram(username);
            }
        },
        
        unblockProfileManually: (username, platform) => {
            logInfo(`Manual unblock request for profile: ${username} on ${platform}`);
            
            if (platform === PLATFORMS.TWITTER) {
                unblockLoadingTwitter();
                
                // Remover o indicador de bloqueio se existir
                const indicator = document.getElementById('botblocker-indicator');
                if (indicator) {
                    indicator.remove();
                }
                
                // Recarregar a página para restaurar o conteúdo
                window.location.reload();
            } else if (platform === PLATFORMS.INSTAGRAM) {
                // Implementar desbloqueio para Instagram
                // Semelhante ao Twitter
            }
        }
    });
}

// Monitorar mudanças de URL
setupUrlChangeMonitor(detectPlatformAndInitialize);

// Inicializar ao carregar
initialize();