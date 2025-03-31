console.log("[Collect Mentions] Content script loaded and running");

// Variável para armazenar os perfis da API
let perfisDaAPI = [];
// Armazenar perfis bloqueados para não repetir o bloqueio
let perfisBlockeados = new Set();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getCurrentProfile") {
        const currentUrl = window.location.href;
        const currentProfile = window.location.pathname.split("/")[1];

        // Find if this profile is in the API data
        const profileData = perfisDaAPI.find(p =>
            p.username && p.username.toLowerCase() === currentProfile.toLowerCase()
        );

        sendResponse({
            url: currentUrl,
            profile: currentProfile,
            apiData: profileData || null
        });
    }
    return true;
});

// Modificar a função fetchPerfis para retornar uma Promise
async function fetchPerfis() {
    return new Promise((resolve, reject) => {
        try {
            console.log('[BotBlocker] Requesting profiles from background script...');

            // Send message to background script
            chrome.runtime.sendMessage({action: "fetchProfiles"}, (response) => {
                if (response && response.success) {
                    perfisDaAPI = response.profiles;
                    console.log('[BotBlocker] Profiles loaded successfully:', perfisDaAPI.length);

                    // Log the profiles loaded for debugging
                    if (perfisDaAPI.length > 0) {
                        console.log('[BotBlocker] Sample profiles:');
                        perfisDaAPI.slice(0, 3).forEach(profile => {
                            console.log(`- ${profile.username}: ${profile.percentage}%`);
                        });
                    }

                    resolve(perfisDaAPI);
                } else {
                    console.error('[BotBlocker] Error fetching profiles from background script');
                    perfisDaAPI = []; // Fallback para array vazio
                    resolve([]); // Resolve com array vazio em caso de erro
                }
            });
        } catch (error) {
            console.error('[BotBlocker] Error in fetchPerfis:', error);
            perfisDaAPI = []; // Fallback para array vazio
            reject(error);
        }
    });
}

fetchPerfis();

const collectedMentions = new Set();

function collectMentions() {
    const usernameElements = document.querySelectorAll('[data-testid="User-Name"]');

    if (usernameElements.length > 0) {
        // Guarda os novos perfis encontrados nesta iteração
        const newProfilesFound = [];

        usernameElements.forEach(element => {
            const usernameLink = element.querySelector('a[href^="/"]');
            if (usernameLink) {
                const mention = usernameLink.getAttribute("href").slice(1);

                // Verificar se este é um novo perfil que ainda não foi coletado
                if (!collectedMentions.has(mention)) {
                    newProfilesFound.push(mention);
                }
                collectedMentions.add(mention); // Removi o @ para facilitar a comparação

                // Verificar se deve aplicar blur ao tweet
                applyBlurToTweet(element, mention);
            }
        });

        // Log dos novos perfis encontrados nesta iteração
        if (newProfilesFound.length > 0) {
            console.log(`%c[LOGS SOLICITADOS] Novos perfis encontrados no DOM (${newProfilesFound.length}):`, 'background: #27AE60; color: white; padding: 2px 5px; border-radius: 3px;');
            newProfilesFound.forEach(perfil => {
                console.log(`%c- @${perfil}`, 'color: #27AE60;');
            });
        }

        // Log de todos os perfis coletados até agora
        if (collectedMentions.size > 0) {
            console.log(`%c[LOGS SOLICITADOS] Total de perfis no DOM (${collectedMentions.size}):`, 'background: #16A085; color: white; padding: 2px 5px; border-radius: 3px;');
            const perfisList = Array.from(collectedMentions);
            perfisList.sort();
            perfisList.forEach(perfil => {
                console.log(`%c- @${perfil}`, 'color: #16A085;');
            });
        }

        // Depois de coletar os perfis, verificar quais precisam ser bloqueados
        verifyAndBlockProfiles();
    }
}

async function applyBlurToTweet(element) {
    const { settings } = await getSettingsAndBlacklist();
    const tolerance = settings.tolerance || 50; // Valor padrão de 50 se não estiver definido
    const badge = settings.badge || 'empty'; // Valor padrão se não estiver definido
    const blacklist = settings.blackList || []; // Lista de perfis a serem bloqueados

    // Estamos recebendo o elemento diretamente (pode ser um article ou um elemento dentro dele)
    const articleContainer = element.tagName === 'ARTICLE' ? element : element.closest('[role="article"]');
    if (!articleContainer) return;

    // Vamos verificar se este artigo contém um repost
    const repostText = articleContainer.textContent || '';
    const repostMatch = repostText.match(/(\w+)\s+reposted/i);

    // Se encontrarmos algo como "Elon Musk reposted"
    if (repostMatch && repostMatch[1]) {
        const reposter = repostMatch[1].toLowerCase();

        // Verificar se o reposter deve ser bloqueado
        const shouldBlockReposter = perfisDaAPI.some(apiPerfil =>
            apiPerfil.username.toLowerCase() === reposter.toLowerCase() &&
            apiPerfil.percentage > tolerance
        );

        if (shouldBlockReposter) {
            // Aplicar blur ao artigo completo
            articleContainer.style.filter = 'blur(5px)';
            articleContainer.style.transition = 'filter 0.3s ease';
            addBlockIndicatorToTweet(articleContainer);
            return; // Não precisamos verificar mais nada
        }
    }

    // Além disso, verificamos o autor original pelo username
    const usernameLinks = articleContainer.querySelectorAll('a[href^="/"]');
    for (const link of usernameLinks) {
        const username = link.getAttribute('href').replace('/', '');
        if (username) {
            // Verificar se o perfil deve ser bloqueado
            const shouldBlock = perfisDaAPI.some(apiPerfil =>
                apiPerfil.username.toLowerCase() === username.toLowerCase() &&
                apiPerfil.percentage > tolerance
            );

            if (shouldBlock) {
                // Aplicar blur ao artigo completo
                articleContainer.style.filter = 'blur(5px)';
                articleContainer.style.transition = 'filter 0.3s ease';
                addBlockIndicatorToTweet(articleContainer);
                return; // Encontramos, não precisamos continuar
            }
        }
    }

    // Se chegamos aqui, não precisamos bloquear
    articleContainer.style.filter = 'none';
    removeBlockIndicatorFromTweet(articleContainer);
}



function addBlockIndicatorToTweet(tweetElement) {
    const indicator = tweetElement.querySelector('.bot-blocker-tweet-indicator');
    if (indicator) return;

    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'bot-blocker-tweet-indicator';
    indicatorDiv.textContent = 'BLOCKED';

    Object.assign(indicatorDiv.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#FF3A3A',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        zIndex: '100',
        fontSize: '14px',
        fontWeight: 'bold',
        pointerEvents: 'none'
    });

    // Adiciona o estilo ao container do tweet
    Object.assign(tweetElement.style, {
        position: 'relative',
        display: 'inline-block'
    });

    tweetElement.appendChild(indicatorDiv);
}

function removeBlockIndicatorFromTweet(tweetElement) {
    const indicator = tweetElement.querySelector('.bot-blocker-tweet-indicator');
    if (indicator) {
        indicator.remove();
    }
}

function addStyles() {
    const styles = `
        .bot-blocker-tweet-indicator {
            pointer-events: none;
            text-shadow: 0 0 5px rgba(255, 58, 58, 0.5);
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// Função para buscar valores do chrome.storage.local
function getStorage(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, resolve);
    });
  }

    // Função para recuperar configurações e lista de bloqueio
    async function getSettingsAndBlacklist() {
        try {
            const result = await getStorage(["settings", "blackList"]);

            // Garantir que settings tenha valores padrão
            const defaultSettings = {
                tolerance: 50,
                badge: 'empty'
            };

            return {
                settings: result.settings || defaultSettings,
                blackList: result.blackList || []
            };
        } catch (error) {
            console.error('Erro ao obter configurações:', error);
            return {
                settings: { tolerance: 50, badge: 'empty' },
                blackList: []
            };
        }
    }



// Nova função para verificar e bloquear perfis com base na API e percentage
async function verifyAndBlockProfiles() {

    const { settings, blackList } = await getSettingsAndBlacklist();

    const tolerance = settings.tolerance || 50; // Valor padrão de 50 se não estiver definido


    if (perfisDaAPI.length === 0) {
        console.log('[BotBlocker] Nenhum perfil da API para comparar. Aguardando carregamento...');
        return;
    }

    console.log('[BotBlocker] Verificando perfis para bloqueio...');

    // Log para mostrar a comparação
    console.log('%c[LOGS SOLICITADOS] Comparação de perfis DOM vs. API:', 'background: #8E44AD; color: white; padding: 2px 5px; border-radius: 3px;');

    // Criar arrays para os resultados da comparação
    const perfilComumComBloqueio = [];
    const perfilComumSemBloqueio = [];
    const perfilSomenteDOM = [];
    const perfilSomenteAPI = [];

    // Verificar perfis encontrados no DOM que estão na API
    collectedMentions.forEach(profileName => {
        const perfilAPI = perfisDaAPI.find(p => p.username.toLowerCase() === profileName.toLowerCase());

        if (perfilAPI) {
            if (perfilAPI.percentage > tolerance) {
                perfilComumComBloqueio.push({
                    username: profileName,
                    percentage: perfilAPI.percentage
                });
            } else {
                perfilComumSemBloqueio.push({
                    username: profileName,
                    percentage: perfilAPI.percentage
                });
            }
        } else {
            perfilSomenteDOM.push(profileName);
        }
    });

    // Encontrar perfis que estão apenas na API
    perfisDaAPI.forEach(perfilAPI => {
        const encontradoNoDOM = Array.from(collectedMentions).some(
            p => p.toLowerCase() === perfilAPI.username.toLowerCase()
        );

        if (!encontradoNoDOM) {
            perfilSomenteAPI.push({
                username: perfilAPI.username,
                percentage: perfilAPI.percentage
            });
        }
    });

    // Exibir os resultados da comparação
    console.log('%c1. Perfis comuns (DOM e API) com percentage > 50% (Serão bloqueados):', 'color: #8E44AD; font-weight: bold;');
    perfilComumComBloqueio.forEach(p => {
        console.log(`%c   - @${p.username} (${p.percentage}%)`, 'color: #FF3A3A; font-weight: bold;');
    });

    console.log('%c2. Perfis comuns (DOM e API) com percentage <= 50% (Não serão bloqueados):', 'color: #8E44AD; font-weight: bold;');
    perfilComumSemBloqueio.forEach(p => {
        console.log(`%c   - @${p.username} (${p.percentage}%)`, 'color: #3498DB;');
    });

    console.log('%c3. Perfis apenas no DOM (Não na API):', 'color: #8E44AD; font-weight: bold;');
    perfilSomenteDOM.forEach(p => {
        console.log(`%c   - @${p}`, 'color: #27AE60;');
    });

    console.log('%c4. Perfis apenas na API (Não no DOM atual):', 'color: #8E44AD; font-weight: bold;');
    perfilSomenteAPI.forEach(p => {
        const estilo = p.percentage > 50 ? 'color: #E67E22;' : 'color: #7F8C8D;';
        console.log(`%c   - @${p.username} (${p.percentage}%)`, estilo);
    });

    // Para cada perfil coletado no feed, verificar se está na lista da API
    collectedMentions.forEach(profileName => {
        // Verificar se já está na lista de bloqueados para não repetir
        if (perfisBlockeados.has(profileName)) {
            return;
        }

        // Procurar o perfil na lista da API
        const perfilAPI = perfisDaAPI.find(p => p.username.toLowerCase() === profileName.toLowerCase());

        if (perfilAPI && perfilAPI.percentage > tolerance) {
            console.log(`[BotBlocker] Perfil ${profileName} encontrado na API com percentage ${perfilAPI.percentage}%. Bloqueando...`);
            blockProfile(profileName);
            perfisBlockeados.add(profileName);
        }
    });
}

const mentionsObserver = new MutationObserver((mutationsList) => {
    collectMentions();
});

// Armazenar a função fetch original
let originalFetch = null;

// Função para bloquear um perfil específico
function blockProfile(profileName) {
    // Verificar se estamos visualizando este perfil
    const currentProfile = window.location.pathname.split("/")[1];
    if (currentProfile === profileName) {
        removeArticles(profileName);
        blockInfiniteLoading(profileName);
        addBlockedIndicator(profileName);
    }
}

function removeArticles(profileName) {
    // Verificar se estamos no perfil alvo antes de remover artigos
    const currentProfile = window.location.pathname.split("/")[1];
    if (currentProfile !== profileName) {
        return; // Não fazer nada se não estivermos no perfil alvo
    }

    const articles = document.querySelectorAll('[role="article"]');
    if (articles.length > 0) {
        console.log(`[Auto Remove Articles] Found ${articles.length} articles to remove for ${profileName}`);
        articles.forEach(article => {
            article.remove();
        });
    }
}

let loadingBlocked = false;
// Armazenar o observador para poder desconectá-lo quando sair do perfil
let loadingObserver = null;
// Perfil atualmente bloqueado
let currentBlockedProfile = null;

function blockInfiniteLoading(profileName) {
    if (loadingBlocked && currentBlockedProfile === profileName) return;

    // Verificar se estamos no perfil alvo
    const currentProfile = window.location.pathname.split("/")[1];
    if (currentProfile !== profileName) {
        return; // Não bloquear se não estivermos no perfil alvo
    }

    loadingBlocked = true;
    currentBlockedProfile = profileName;
    console.log(`[Block Loading] Starting to block infinite loading for ${profileName}`);

    // 1. Salvar a função fetch original se ainda não foi salva
    if (!originalFetch) {
        originalFetch = window.fetch;
    }

    // 2. Interceptar apenas as requisições de mais tweets
    window.fetch = async function(...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
        const body = args[1]?.body;

        // Verificar novamente se ainda estamos no perfil alvo
        const currentPath = window.location.pathname.split("/")[1];

        // Verificar se é uma requisição para carregar mais tweets E estamos no perfil alvo
        if (currentPath === profileName &&
            url && url.includes('graphql') &&
            body && (body.includes('UserTweets') ||
                    body.includes('UserMedia') ||
                    body.includes('UserByScreenName'))) {
            console.log(`[Block Loading] Intercepted tweet load request for ${profileName}`);

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

    // 3. Observador para remover os indicadores de carregamento sem afetar o layout
    loadingObserver = new MutationObserver(() => {
        // Verificar se ainda estamos no perfil alvo
        const currentPath = window.location.pathname.split("/")[1];
        if (currentPath !== profileName) {
            return; // Não fazer nada se não estivermos no perfil alvo
        }

        // Remover spinner de carregamento
        document.querySelectorAll('div[role="progressbar"]').forEach(el => {
            const loadingContainer = el.closest('[data-testid="cellInnerDiv"]');
            if (loadingContainer) {
                console.log(`[Block Loading] Removing loading indicator for ${profileName}`);
                loadingContainer.remove();
            } else {
                el.style.display = 'none';
            }
        });

        // Remover botões "Mostrar mais"
        document.querySelectorAll('[role="button"]').forEach(button => {
            if (button.textContent &&
                (button.textContent.includes('Show more') ||
                button.textContent.includes('Mostrar mais'))) {
                const buttonContainer = button.closest('[data-testid="cellInnerDiv"]');
                if (buttonContainer) {
                    console.log(`[Block Loading] Removing "Show more" button for ${profileName}`);
                    buttonContainer.remove();
                }
            }
        });
    });

    loadingObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log(`[Block Loading] Tweet loading blocked successfully for ${profileName}`);
}

function unblockLoading() {
    if (!loadingBlocked) return;

    console.log(`[Block Loading] Unblocking infinite loading for ${currentBlockedProfile}`);

    // 1. Restaurar a função fetch original
    if (originalFetch) {
        window.fetch = originalFetch;
        console.log('[Block Loading] Restored original fetch function');
    }

    // 2. Desconectar o observador de loading
    if (loadingObserver) {
        loadingObserver.disconnect();
        console.log('[Block Loading] Disconnected loading observer');
    }

    loadingBlocked = false;
    currentBlockedProfile = null;
}

function addBlockedIndicator(profileName) {
    // Verificar se estamos no perfil alvo
    const currentProfile = window.location.pathname.split("/")[1];
    if (currentProfile !== profileName) {
        return false; // Não adicionar indicador se não estivermos no perfil alvo
    }

    // Verificar se o indicador já existe para não duplicar
    if (document.getElementById('botblocker-indicator')) {
        return true;
    }

    console.log(`[BotBlocker] Attempting to add blocked indicator for ${profileName}`);

    // Procurar pelo elemento que contém o nome do perfil
    const profileNameElement = document.querySelector('[data-testid="UserName"]');

    if (profileNameElement) {
        console.log('[BotBlocker] Found profile name element:', profileNameElement);

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
        blockedIndicator.style.marginLeft = '12px'; // Espaço após o nome/badge
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

        // Tentar encontrar o elemento H1 ou H2 que contém o nome e os badges
        const nameHeader = profileNameElement.querySelector('h1') || profileNameElement.querySelector('h2') ||
                          profileNameElement.closest('h1') || profileNameElement.closest('h2');

        if (nameHeader) {
            console.log('[BotBlocker] Found name header element:', nameHeader);

            // Criar um wrapper para o header e o indicador
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.width = '100%';
            wrapper.style.flexWrap = 'nowrap';

            // Substituir o header pelo wrapper
            nameHeader.parentNode.insertBefore(wrapper, nameHeader);
            wrapper.appendChild(nameHeader);
            wrapper.appendChild(blockedIndicator);

            console.log(`[BotBlocker] Blocked indicator added successfully for ${profileName}`);
            return true;
        }

        // Se não encontrar o header, tentar procurar o SpanWrapper
        const spanWrapper = profileNameElement.querySelector('span[dir="auto"]') ||
                           profileNameElement.querySelector('span');

        if (spanWrapper) {
            console.log('[BotBlocker] Found span wrapper element:', spanWrapper);

            // Encontrar o contêiner pai do span
            const spanContainer = spanWrapper.parentElement;

            // Criar um wrapper flex
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.width = '100%';
            wrapper.style.flexWrap = 'nowrap';

            // Substituir o contêiner pelo wrapper
            spanContainer.parentNode.insertBefore(wrapper, spanContainer);
            wrapper.appendChild(spanContainer);
            wrapper.appendChild(blockedIndicator);

            console.log(`[BotBlocker] Blocked indicator added successfully for ${profileName}`);
            return true;
        }

        // Se nenhum dos métodos acima funcionar, tentar adicionar após os badges do nome
        const badges = profileNameElement.querySelector('[data-testid="UserBadges"]');
        if (badges) {
            console.log('[BotBlocker] Found user badges element:', badges);

            // Adicionar o indicador após os badges
            badges.parentNode.insertBefore(blockedIndicator, badges.nextSibling);

            // Ajustar o display do contêiner pai para flex
            const badgesContainer = badges.parentElement;
            badgesContainer.style.display = 'flex';
            badgesContainer.style.alignItems = 'center';
            badgesContainer.style.flexWrap = 'nowrap';

            console.log(`[BotBlocker] Blocked indicator added successfully for ${profileName}`);
            return true;
        }

        // Último recurso: adicionar diretamente após o nome do perfil
        profileNameElement.appendChild(blockedIndicator);
        profileNameElement.style.display = 'flex';
        profileNameElement.style.alignItems = 'center';
        profileNameElement.style.flexWrap = 'nowrap';

        console.log(`[BotBlocker] Blocked indicator added directly for ${profileName}`);
        return true;
    }

    // Método alternativo: procurar pelo cabeçalho do perfil
    const profileHeader = document.querySelector('[data-testid="UserName"], [data-testid="UserProfileHeader"]');

    if (profileHeader) {
        console.log('[BotBlocker] Using fallback - found profile header:', profileHeader);

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

        // Criar um wrapper flex para o cabeçalho
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.flexWrap = 'nowrap';

        // Adicionar o wrapper no lugar do cabeçalho
        profileHeader.parentNode.insertBefore(wrapper, profileHeader);
        wrapper.appendChild(profileHeader);
        wrapper.appendChild(blockedIndicator);

        console.log(`[BotBlocker] Blocked indicator added successfully for ${profileName}`);
        return true;
    }

    console.log('[BotBlocker] Could not find suitable element for indicator placement');
    return false;
}

async function checkProfileAndProcessBlocking() {
    const { settings, blackList } = await getSettingsAndBlacklist();
    const tolerance = settings.tolerance || 50; // Valor padrão de 50 se não estiver definido
    const currentProfile = window.location.pathname.split("/")[1];

    // Verificar se o perfil atual está na lista de perfis para bloquear
    if (perfisDaAPI.length > 0) {
        const perfilAPI = perfisDaAPI.find(p => p.username.toLowerCase() === currentProfile.toLowerCase());

        if (perfilAPI && perfilAPI.percentage > tolerance) {
            console.log(`[BotBlocker] Perfil atual ${currentProfile} encontrado na API com percentage ${perfilAPI.percentage}%. Bloqueando...`);

            removeArticles(currentProfile);
            blockInfiniteLoading(currentProfile);

            // Tentar adicionar o indicador várias vezes, pois a estrutura da página pode estar carregando
            let indicatorAdded = addBlockedIndicator(currentProfile);
            if (!indicatorAdded) {
                // Se não conseguir adicionar imediatamente, tentar algumas vezes com intervalos
                let attempts = 0;
                const indicatorInterval = setInterval(() => {
                    if (attempts >= 5 || addBlockedIndicator(currentProfile)) {
                        clearInterval(indicatorInterval);
                        console.log(`[BotBlocker] Indicator added after ${attempts + 1} attempts`);
                    }
                    attempts++;
                }, 1000);
            }

            // Adicionar ao conjunto de perfis bloqueados
            perfisBlockeados.add(currentProfile);
        } else if (loadingBlocked && currentBlockedProfile === currentProfile) {
            // Se estamos em um perfil que não precisa ser bloqueado mas está sendo bloqueado
            console.log(`[BotBlocker] Perfil ${currentProfile} não precisa ser bloqueado. Desbloqueando...`);
            unblockLoading();

            // Remover o indicador
            const indicator = document.getElementById('botblocker-indicator');
            if (indicator) {
                indicator.remove();
            }
        }
    } else {
        console.log('[BotBlocker] Aguardando carregamento de perfis da API...');
    }
}

const pageObserver = new MutationObserver(() => {
    checkProfileAndProcessBlocking();
    collectMentions();
});

function initializeScripts() {
    collectMentions();

    // Esperar um pouco para que o DOM esteja mais carregado antes de verificar o perfil
    setTimeout(() => {
        checkProfileAndProcessBlocking();
        pageObserver.observe(document.body, { childList: true, subtree: true });
    }, 1000);
}

let previousUrl = window.location.href;
const urlCheckInterval = setInterval(() => {
    if (window.location.href !== previousUrl) {
        console.log("[BotBlocker] URL changed from", previousUrl, "to", window.location.href);

        // Verificar se estávamos em um perfil bloqueado e agora não estamos mais
        if (loadingBlocked) {
            const currentProfile = window.location.pathname.split("/")[1];
            if (currentProfile !== currentBlockedProfile) {
                console.log("[Block Loading] Detected navigation away from blocked profile");
                unblockLoading();

                // Remover o indicador
                const indicator = document.getElementById('botblocker-indicator');
                if (indicator) {
                    indicator.remove();
                }
            }
        }

        previousUrl = window.location.href;
        pageObserver.disconnect();
        initializeScripts();
    }
}, 1000);


addStyles();
initializeScripts();

async function checkProfileAndProcessBlocking() {
    const { settings, blackList } = await getSettingsAndBlacklist();
    const tolerance = settings.tolerance || 50;
    const currentProfile = window.location.pathname.split("/")[1];

    // Send message to background script to check blocked status
    chrome.runtime.sendMessage({
        action: "checkBlockedStatus",
        username: currentProfile,
        social: 'x', // or dynamically determine the social platform
        accessToken: localStorage.getItem('access_token')
    }, (response) => {
        if (response.success) {
            if (response.isBlocked) {
                console.log(`[BotBlocker] Profile ${currentProfile} is blocked`);
                removeArticles(currentProfile);
                blockInfiniteLoading(currentProfile);
                addBlockedIndicator(currentProfile);
            }
        }
    });

    // Existing API-based blocking logic remains the same
    if (perfisDaAPI.length > 0) {
        const perfilAPI = perfisDaAPI.find(p => p.username.toLowerCase() === currentProfile.toLowerCase());

        if (perfilAPI && perfilAPI.percentage > tolerance) {
            // Existing blocking logic
        }
    }
}