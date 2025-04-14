/**
 * Implementação específica para o Instagram
 */
import { addGlobalStyles, addBlockIndicator, removeBlockIndicator } from '../utils/dom-helpers';
import { getSettingsAndBlacklist } from '../utils/storage';
import { getCurrentProfile } from '../modules/platform-detector';
import { 
    shouldBlockProfile, 
    addProfileToCollection, 
    markProfileAsBlocked,
    isProfileAlreadyBlocked,
    generateComparisonLogs,
    collectedMentions
} from '../modules/profile-manager';
import { logInfo, logError } from '../utils/logging';
import { PLATFORMS, SELECTORS } from '../constants';

// Variáveis para controle de bloqueio
let originalFetch = null;
let loadingBlocked = false;
let loadingObserver = null;
let currentBlockedProfile = null;

// Obter perfil atual no Instagram
export function getCurrentProfileInstagram() {
    const pathname = window.location.pathname;
    // No Instagram, a URL do perfil é simplesmente /nome_usuario
    if (pathname.startsWith('/') && pathname.length > 1) {
        return pathname.substring(1).split('/')[0];
    }
    return null;
}

// Coletar menções de perfis na página
export function collectMentionsInstagram() {
    // No Instagram, os links para perfis geralmente estão em tags <a> com formatos específicos
    const userLinks = document.querySelectorAll('a[href^="/"]');
    
    const newProfilesFound = [];
    
    userLinks.forEach(link => {
        const href = link.getAttribute('href');
        // Verificar se é um link para um perfil (não stories, explore, etc)
        if (href && href.startsWith('/') && !href.includes('/p/') && !href.includes('/explore/') 
            && !href.includes('/stories/') && href.split('/').length <= 2) {
            
            const mention = href.substring(1); // Remove a / inicial
            
            if (addProfileToCollection(mention)) {
                newProfilesFound.push(mention);
            }
            
            // Verificar se deve aplicar blur ao post
            const postElement = link.closest(SELECTORS[PLATFORMS.INSTAGRAM].POST);
            if (postElement) {
                applyBlurToPost(postElement, mention);
            }
        }
    });
    
    // Log dos novos perfis encontrados
    if (newProfilesFound.length > 0) {
        logInfo(`Novos perfis encontrados no Instagram: ${newProfilesFound.length}`);
    }
    
    // Verificar quais perfis precisam ser bloqueados
    verifyAndBlockProfilesInstagram();
}

// Aplicar blur a um post
export async function applyBlurToPost(postElement, mention) {
    try {
        // Verificar se o perfil deve ser bloqueado
        const blockStatus = await shouldBlockProfile(mention, PLATFORMS.INSTAGRAM);
        
        if (blockStatus.blocked) {
            // Aplicar blur ao post
            postElement.style.filter = 'blur(5px)';
            postElement.style.transition = 'filter 0.3s ease';
            addBlockIndicator(postElement, 'bot-blocker-post-indicator');
        } else {
            // Remover blur se não deve ser bloqueado
            postElement.style.filter = 'none';
            removeBlockIndicator(postElement, 'bot-blocker-post-indicator');
        }
    } catch (error) {
        logError('Erro ao aplicar blur ao post:', error);
    }
}

// Verificar quais perfis precisam ser bloqueados
export async function verifyAndBlockProfilesInstagram() {
    // Log de comparação
    await generateComparisonLogs(PLATFORMS.INSTAGRAM);
    
    // Para cada perfil coletado, verificar se precisa ser bloqueado
    for (const profileName of collectedMentions) {
        // Verificar se já está bloqueado para evitar repetição
        if (isProfileAlreadyBlocked(profileName)) {
            continue;
        }
        
        // Verificar se deve ser bloqueado
        const blockStatus = await shouldBlockProfile(profileName, PLATFORMS.INSTAGRAM);
        
        if (blockStatus.blocked) {
            if (blockStatus.reason === 'manual') {
                logInfo(`Perfil ${profileName} está na blacklist. A bloquear...`);
            } else if (blockStatus.reason === 'badge') {
                logInfo(`Perfil ${profileName} tem badge '${blockStatus.badge}' que corresponde à configuração de bloqueio. Bloqueando...`);
            } else if (blockStatus.reason === 'automatic') {
                logInfo(`Perfil ${profileName} encontrado na API com percentage ${blockStatus.percentage}%. Automaticamente bloqueando...`);
            }
            
            blockProfileInstagram(profileName);
            markProfileAsBlocked(profileName);
        }
    }
}

// Bloquear um perfil específico
export function blockProfileInstagram(profileName) {
    // Verificar se estamos visualizando este perfil
    const currentProfile = getCurrentProfileInstagram();
    
    if (currentProfile === profileName) {
        // Estamos na página do perfil - bloquear completamente
        removePostsInstagram(profileName);
        blockInfiniteLoadingInstagram(profileName);
        addBlockedIndicatorInstagram(profileName);
    } else {
        // Estamos no feed - apenas aplicar blur aos posts deste usuário
        applyBlurToAllPostsFromUser(profileName);
    }
}

// Aplicar blur a todos os posts de um usuário específico no feed
export function applyBlurToAllPostsFromUser(username) {
    logInfo(`Aplicando blur a todos os posts de ${username}`);
    
    // Encontrar todos os posts no feed
    const posts = document.querySelectorAll(SELECTORS[PLATFORMS.INSTAGRAM].POST);
    
    posts.forEach(post => {
        const userLinks = post.querySelectorAll('a[href^="/"]');
        
        for (const link of userLinks) {
            const href = link.getAttribute('href');
            if (href && href.startsWith('/') && !href.includes('/p/')) {
                const linkUsername = href.substring(1).split('/')[0];
                
                if (linkUsername.toLowerCase() === username.toLowerCase()) {
                    // Aplicar blur a este post
                    post.style.filter = 'blur(5px)';
                    post.style.transition = 'filter 0.3s ease';
                    addBlockIndicator(post, 'bot-blocker-post-indicator');
                    break;
                }
            }
        }
    });
}

// Remover blur de todos os posts de um usuário específico
export function removeBlurFromUserPosts(username) {
    logInfo(`Removendo blur dos posts de ${username}`);
    
    // Encontrar todos os posts no feed
    const posts = document.querySelectorAll(SELECTORS[PLATFORMS.INSTAGRAM].POST);
    
    posts.forEach(post => {
        const userLinks = post.querySelectorAll('a[href^="/"]');
        
        for (const link of userLinks) {
            const href = link.getAttribute('href');
            if (href && href.startsWith('/') && !href.includes('/p/')) {
                const linkUsername = href.substring(1).split('/')[0];
                
                if (linkUsername.toLowerCase() === username.toLowerCase()) {
                    // Remover blur deste post
                    post.style.filter = 'none';
                    removeBlockIndicator(post, 'bot-blocker-post-indicator');
                    break;
                }
            }
        }
    });
}

// Remover posts do perfil bloqueado
export function removePostsInstagram(profileName) {
    // Verificar se estamos no perfil alvo
    const currentProfile = getCurrentProfileInstagram();
    if (currentProfile !== profileName) {
        return;
    }
    
    // No Instagram, os posts geralmente estão em elementos article
    const posts = document.querySelectorAll(SELECTORS[PLATFORMS.INSTAGRAM].POST);
    if (posts.length > 0) {
        logInfo(`Encontrados ${posts.length} posts para remover de ${profileName}`);
        posts.forEach(post => {
            post.remove();
        });
    }
}

// Bloquear carregamento infinito
export function blockInfiniteLoadingInstagram(profileName) {
    if (loadingBlocked && currentBlockedProfile === profileName) return;
    
    // Verificar se estamos no perfil alvo
    const currentProfile = getCurrentProfileInstagram();
    if (currentProfile !== profileName) {
        return;
    }
    
    loadingBlocked = true;
    currentBlockedProfile = profileName;
    logInfo(`Começando a bloquear carregamento infinito para ${profileName}`);
    
    // Salvar a função fetch original
    if (!originalFetch) {
        originalFetch = window.fetch;
    }
    
    // Interceptar requisições para o Instagram GraphQL
    window.fetch = async function(...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
        
        // Verificar se estamos no perfil alvo
        const currentPath = getCurrentProfileInstagram();
        
        // Verificar se é uma requisição para carregar mais posts
        if (currentPath === profileName &&
            url && (url.includes('graphql') || 
                   url.includes('api/v1/feed/user'))) {
            logInfo(`Requisição interceptada para carregar posts de ${profileName}`);
            
            // Retornar uma resposta vazia mas válida
            return new Response(JSON.stringify({
                data: {
                    user: {
                        edge_owner_to_timeline_media: {
                            edges: [],
                            page_info: {
                                has_next_page: false
                            }
                        }
                    }
                }
            }));
        }
        return originalFetch.apply(this, args);
    };
    
    // Observador para remover os indicadores de carregamento
    loadingObserver = new MutationObserver(() => {
        // Verificar se ainda estamos no perfil alvo
        const currentPath = getCurrentProfileInstagram();
        if (currentPath !== profileName) {
            return; 
        }
        
        // Remover spinner de carregamento
        document.querySelectorAll(SELECTORS[PLATFORMS.INSTAGRAM].LOADING).forEach(el => {
            const loadingContainer = el.closest('div');
            if (loadingContainer) {
                logInfo(`Removendo indicador de carregamento para ${profileName}`);
                loadingContainer.style.display = 'none';
            } else {
                el.style.display = 'none';
            }
        });
    });
    
    loadingObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    logInfo(`Carregamento de posts bloqueado com sucesso para ${profileName}`);
}

// Desbloquear carregamento
export function unblockLoadingInstagram() {
    if (!loadingBlocked) return;
    
    logInfo(`Desbloqueando carregamento infinito para ${currentBlockedProfile}`);
    
    // Restaurar a função fetch original
    if (originalFetch) {
        window.fetch = originalFetch;
        logInfo('Função fetch original restaurada');
    }
    
    // Desconectar o observador
    if (loadingObserver) {
        loadingObserver.disconnect();
        logInfo('Observador de carregamento desconectado');
    }
    
    loadingBlocked = false;
    currentBlockedProfile = null;
}

// Adicionar indicador de bloqueio
export function addBlockedIndicatorInstagram(profileName) {
    // Verificar se estamos no perfil alvo
    const currentProfile = getCurrentProfileInstagram();
    if (currentProfile !== profileName) {
        return false;
    }
    
    // Verificar se o indicador já existe
    if (document.getElementById('botblocker-indicator')) {
        return true;
    }
    
    logInfo(`Tentando adicionar indicador de bloqueio para ${profileName}`);
    
    // No Instagram, o cabeçalho do perfil está na seção header
    const profileHeader = document.querySelector(SELECTORS[PLATFORMS.INSTAGRAM].PROFILE_HEADER);
    
    if (profileHeader) {
        logInfo('Cabeçalho do perfil encontrado');
        
        // Criar o card indicador
        const blockedIndicator = document.createElement('div');
        blockedIndicator.id = 'botblocker-indicator';
        blockedIndicator.style.backgroundColor = '#FF3A3A';
        blockedIndicator.style.color = 'white';
        blockedIndicator.style.padding = '4px 10px';
        blockedIndicator.style.borderRadius = '4px';
        blockedIndicator.style.display = 'flex';
        blockedIndicator.style.flexDirection = 'column';
        blockedIndicator.style.alignItems = 'center';
        blockedIndicator.style.marginLeft = '12px';
        
        // Texto "BLOCKED"
        const blockedText = document.createElement('span');
        blockedText.textContent = 'BLOCKED';
        blockedText.style.fontWeight = 'bold';
        blockedText.style.fontSize = '14px';
        blockedText.style.lineHeight = '1.2';
        
        // Tag "BotBlocker"
        const botBlockerTag = document.createElement('span');
        botBlockerTag.textContent = 'BotBlocker';
        botBlockerTag.style.fontSize = '11px';
        botBlockerTag.style.opacity = '0.9';
        botBlockerTag.style.marginTop = '2px';
        
        // Adicionar elementos ao indicador
        blockedIndicator.appendChild(blockedText);
        blockedIndicator.appendChild(botBlockerTag);
        
        // Adicionar o indicador ao cabeçalho
        profileHeader.appendChild(blockedIndicator);
        
        logInfo(`Indicador de bloqueio adicionado com sucesso para ${profileName}`);
        return true;
    }
    
    logInfo('Não foi possível encontrar um elemento adequado para colocar o indicador');
    return false;
}

// Verificar e processar bloqueio para o perfil atual
export async function checkProfileAndProcessBlockingInstagram() {
    try {
        const currentProfile = getCurrentProfileInstagram();
        if (!currentProfile) return;
        
        const blockStatus = await shouldBlockProfile(currentProfile, PLATFORMS.INSTAGRAM);
        
        if (blockStatus.blocked) {
            logInfo(`Perfil ${currentProfile} deve ser bloqueado. Razão: ${blockStatus.reason}`);
            
            removePostsInstagram(currentProfile);
            blockInfiniteLoadingInstagram(currentProfile);
            
            // Tentar adicionar o indicador várias vezes
            let indicatorAdded = addBlockedIndicatorInstagram(currentProfile);
            if (!indicatorAdded) {
                let attempts = 0;
                const indicatorInterval = setInterval(() => {
                    if (attempts >= 5 || addBlockedIndicatorInstagram(currentProfile)) {
                        clearInterval(indicatorInterval);
                    }
                    attempts++;
                }, 1000);
            }
            
            markProfileAsBlocked(currentProfile);
        } else if (loadingBlocked && currentBlockedProfile === currentProfile) {
            // Se o perfil não precisa mais ser bloqueado, desbloquear
            logInfo(`Perfil ${currentProfile} não precisa ser bloqueado. Desbloqueando...`);
            unblockLoadingInstagram();
            
            // Remover o indicador
            const indicator = document.getElementById('botblocker-indicator');
            if (indicator) {
                indicator.remove();
            }
        }
    } catch (error) {
        logError('Erro ao verificar e processar bloqueio para o perfil atual:', error);
    }
}

// Inicializar scripts do Instagram
export function initializeInstagram() {
    logInfo("Inicializando scripts do Instagram");
    
    // Adicionar estilos globais
    addGlobalStyles();
    
    // Coletar menções iniciais
    collectMentionsInstagram();
    
    // Verificar e processar bloqueio para o perfil atual
    checkProfileAndProcessBlockingInstagram();
    
    // Configurar observer para mudanças no DOM
    const observer = new MutationObserver(() => {
        collectMentionsInstagram();
        checkProfileAndProcessBlockingInstagram();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Monitorar mudanças de URL para SPAs
    let previousUrl = window.location.href;
    setInterval(() => {
        if (window.location.href !== previousUrl) {
            logInfo(`URL mudou de ${previousUrl} para ${window.location.href}`);
            previousUrl = window.location.href;
            
            // Verificar se estávamos em um perfil bloqueado e agora não estamos mais
            if (loadingBlocked) {
                const currentProfile = getCurrentProfileInstagram();
                if (currentProfile !== currentBlockedProfile) {
                    logInfo("Detectada navegação para fora do perfil bloqueado");
                    unblockLoadingInstagram();
                    
                    // Remover o indicador
                    const indicator = document.getElementById('botblocker-indicator');
                    if (indicator) {
                        indicator.remove();
                    }
                }
            }
            
            // Reiniciar coleta de menções
            collectMentionsInstagram();
            
            // Verificar e processar bloqueio para o perfil atual
            checkProfileAndProcessBlockingInstagram();
        }
    }, 1000);
}