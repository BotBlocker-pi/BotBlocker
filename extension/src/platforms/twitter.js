/**
 * Implementação específica para o Twitter/X
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
import { logInfo } from '../utils/logging';
import { PLATFORMS, SELECTORS } from '../constants';

// Variáveis para controle de bloqueio
let originalFetch = null;
let loadingBlocked = false;
let loadingObserver = null;
let currentBlockedProfile = null;

// Coletar menções de perfis na página
export function collectMentionsTwitter() {
    const usernameElements = document.querySelectorAll(SELECTORS[PLATFORMS.TWITTER].PROFILE_NAME);
    
    if (usernameElements.length > 0) {
        // Guarda os novos perfis encontrados nesta iteração
        const newProfilesFound = [];

        usernameElements.forEach(element => {
            const usernameLink = element.querySelector('a[href^="/"]');
            if (usernameLink) {
                const mention = usernameLink.getAttribute("href").slice(1);

                // Verificar se este é um novo perfil que ainda não foi coletado
                if (addProfileToCollection(mention)) {
                    newProfilesFound.push(mention);
                }

                // Verificar se deve aplicar blur ao tweet
                applyBlurToTweet(element, mention);
            }
        });

        // Log dos novos perfis encontrados
        if (newProfilesFound.length > 0) {
            logInfo(`Novos perfis encontrados no DOM: ${newProfilesFound.length}`);
        }
        
        // Verificar quais perfis precisam ser bloqueados
        verifyAndBlockProfilesTwitter();
    }
}

// Aplicar blur a um tweet
export async function applyBlurToTweet(element, mention) {
    // Obter o artigo mais próximo
    const articleContainer = element.closest(SELECTORS[PLATFORMS.TWITTER].ARTICLE);
    if (!articleContainer) return;
    
    // Verificar se o perfil deve ser bloqueado
    const blockStatus = await shouldBlockProfile(mention, PLATFORMS.TWITTER);
    
    if (blockStatus.blocked) {
        // Aplicar blur ao tweet
        articleContainer.style.filter = 'blur(5px)';
        articleContainer.style.transition = 'filter 0.3s ease';
        addBlockIndicator(articleContainer, 'bot-blocker-tweet-indicator');
    } else {
        // Remover blur se não deve ser bloqueado
        articleContainer.style.filter = 'none';
        removeBlockIndicator(articleContainer, 'bot-blocker-tweet-indicator');
    }
}

// Verificar quais perfis precisam ser bloqueados
export async function verifyAndBlockProfilesTwitter() {
    // Log de comparação
    await generateComparisonLogs(PLATFORMS.TWITTER);
    
    // Para cada perfil coletado, verificar se precisa ser bloqueado
    for (const profileName of collectedMentions) {
        // Verificar se já está bloqueado para evitar repetição
        if (isProfileAlreadyBlocked(profileName)) {
            continue;
        }
        
        // Verificar se deve ser bloqueado
        const blockStatus = await shouldBlockProfile(profileName, PLATFORMS.TWITTER);
        
        if (blockStatus.blocked) {
            if (blockStatus.reason === 'manual') {
                logInfo(`Perfil ${profileName} está na blacklist. A bloquear...`);
            } else {
                logInfo(`Profile ${profileName} found in API with percentage ${blockStatus.percentage}%. Automatically blocking...`);
            }
            
            blockProfileTwitter(profileName);
            markProfileAsBlocked(profileName);
        }
    }
}

// Bloquear um perfil específico
export function blockProfileTwitter(profileName) {
    // Verificar se estamos visualizando este perfil
    const currentProfile = getCurrentProfile(PLATFORMS.TWITTER);
    if (currentProfile === profileName) {
        removeArticlesTwitter(profileName);
        blockInfiniteLoadingTwitter(profileName);
        addBlockedIndicatorTwitter(profileName);
    }
}

// Remover artigos do perfil bloqueado
export function removeArticlesTwitter(profileName) {
    // Verificar se estamos no perfil alvo
    const currentProfile = getCurrentProfile(PLATFORMS.TWITTER);
    if (currentProfile !== profileName) {
        return;
    }
    
    const articles = document.querySelectorAll(SELECTORS[PLATFORMS.TWITTER].ARTICLE);
    if (articles.length > 0) {
        logInfo(`Found ${articles.length} articles to remove for ${profileName}`);
        articles.forEach(article => {
            article.remove();
        });
    }
}

// Bloquear carregamento infinito
export function blockInfiniteLoadingTwitter(profileName) {
    if (loadingBlocked && currentBlockedProfile === profileName) return;

    // Verificar se estamos no perfil alvo
    const currentProfile = getCurrentProfile(PLATFORMS.TWITTER);
    if (currentProfile !== profileName) {
        return;
    }

    loadingBlocked = true;
    currentBlockedProfile = profileName;
    logInfo(`Starting to block infinite loading for ${profileName}`);

    // Salvar a função fetch original
    if (!originalFetch) {
        originalFetch = window.fetch;
    }

    // Interceptar requisições
    window.fetch = async function(...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
        const body = args[1]?.body;

        // Verificar se ainda estamos no perfil alvo
        const currentPath = getCurrentProfile(PLATFORMS.TWITTER);

        // Verificar se é uma requisição para carregar mais tweets
        if (currentPath === profileName &&
            url && url.includes('graphql') &&
            body && (body.includes('UserTweets') ||
                    body.includes('UserMedia') ||
                    body.includes('UserByScreenName'))) {
            logInfo(`Intercepted tweet load request for ${profileName}`);

            // Retornar uma resposta vazia mas válida
            return new Response(JSON.stringify({
                data: {
                    user: {
                        result: {
                            timeline_v2: {
                                timeline: {
                                    instructions: []
                                }
                            },
                            timeline: {
                                timeline: {
                                    instructions: []
                                }
                            }
                        }
                    }
                }
            }));
        }
        return originalFetch.apply(this, args);
    };

    // Observador para remover indicadores de carregamento
    loadingObserver = new MutationObserver(() => {
        // Verificar se ainda estamos no perfil alvo
        const currentPath = getCurrentProfile(PLATFORMS.TWITTER);
        if (currentPath !== profileName) {
            return;
        }

        // Remover spinner de carregamento
        document.querySelectorAll(SELECTORS[PLATFORMS.TWITTER].LOADING).forEach(el => {
            const loadingContainer = el.closest('[data-testid="cellInnerDiv"]');
            if (loadingContainer) {
                logInfo(`Removing loading indicator for ${profileName}`);
                loadingContainer.remove();
            } else {
                el.style.display = 'none';
            }
        });

        // Remover botões "Mostrar mais"
        document.querySelectorAll(SELECTORS[PLATFORMS.TWITTER].SHOW_MORE).forEach(button => {
            if (button.textContent &&
                (button.textContent.includes('Show more') ||
                button.textContent.includes('Mostrar mais'))) {
                const buttonContainer = button.closest('[data-testid="cellInnerDiv"]');
                if (buttonContainer) {
                    logInfo(`Removing "Show more" button for ${profileName}`);
                    buttonContainer.remove();
                }
            }
        });
    });

    loadingObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    logInfo(`Tweet loading blocked successfully for ${profileName}`);
}

// Desbloquear carregamento
export function unblockLoading() {
    if (!loadingBlocked) return;

    logInfo(`Unblocking infinite loading for ${currentBlockedProfile}`);

    // Restaurar a função fetch original
    if (originalFetch) {
        window.fetch = originalFetch;
        logInfo('Restored original fetch function');
    }

    // Desconectar o observador
    if (loadingObserver) {
        loadingObserver.disconnect();
        logInfo('Disconnected loading observer');
    }

    loadingBlocked = false;
    currentBlockedProfile = null;
}

// Adicionar indicador de bloqueio
export function addBlockedIndicatorTwitter(profileName) {
    // Verificar se estamos no perfil alvo
    const currentProfile = getCurrentProfile(PLATFORMS.TWITTER);
    if (currentProfile !== profileName) {
        return false;
    }

    // Verificar se já existe
    if (document.getElementById('botblocker-indicator')) {
        return true;
    }

    logInfo(`Attempting to add blocked indicator for ${profileName}`);

    // Procurar pelo elemento que contém o nome do perfil
    const profileNameElement = document.querySelector('[data-testid="UserName"]');

    if (profileNameElement) {
        logInfo('Found profile name element');

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
        blockedIndicator.style.justifyContent = 'center';
        blockedIndicator.style.marginLeft = '12px';
        blockedIndicator.style.alignSelf = 'center';

        // Texto "BLOCKED"
        const blockedText = document.createElement('span');
        blockedText.textContent = 'BLOCKED';
        blockedText.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        blockedText.style.fontWeight = 'bold';
        blockedText.style.fontSize = '14px';
        blockedText.style.lineHeight = '1.2';

        // Tag "BotBlocker"
        const botBlockerTag = document.createElement('span');
        botBlockerTag.textContent = 'BotBlocker';
        botBlockerTag.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        botBlockerTag.style.fontSize = '11px';
        botBlockerTag.style.opacity = '0.9';
        botBlockerTag.style.marginTop = '2px';

        // Adicionar elementos ao indicador
        blockedIndicator.appendChild(blockedText);
        blockedIndicator.appendChild(botBlockerTag);

        // Encontrar o cabeçalho
        const nameHeader = profileNameElement.querySelector('h1') || profileNameElement.querySelector('h2') ||
                          profileNameElement.closest('h1') || profileNameElement.closest('h2');

        if (nameHeader) {
            logInfo('Found name header element');

            // Criar wrapper
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.width = '100%';
            wrapper.style.flexWrap = 'nowrap';

            // Substituir o header pelo wrapper
            nameHeader.parentNode.insertBefore(wrapper, nameHeader);
            wrapper.appendChild(nameHeader);
            wrapper.appendChild(blockedIndicator);

            logInfo(`Blocked indicator added successfully for ${profileName}`);
            return true;
        }

        // Fallback para procurar span
        const spanWrapper = profileNameElement.querySelector('span[dir="auto"]') ||
                           profileNameElement.querySelector('span');

        if (spanWrapper) {
            logInfo('Found span wrapper element');
            
            // Encontrar o contêiner pai
            const spanContainer = spanWrapper.parentElement;

            // Criar wrapper
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.width = '100%';
            wrapper.style.flexWrap = 'nowrap';

            // Substituir o container pelo wrapper
            spanContainer.parentNode.insertBefore(wrapper, spanContainer);
            wrapper.appendChild(spanContainer);
            wrapper.appendChild(blockedIndicator);

            logInfo(`Blocked indicator added successfully for ${profileName}`);
            return true;    
        }
    }

    logInfo(`Failed to add blocked indicator for ${profileName}`);
    return false;
}