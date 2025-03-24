console.log("[Collect Mentions] Content script loaded and running");

// Variável para armazenar os perfis da API
let perfisDaAPI = [];

// Função simples para buscar perfis da API
async function fetchPerfis() {
    try {
        const response = await fetch('http://localhost:8000/perfis/');
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        const data = await response.json();
        perfisDaAPI = data.perfis;
    } catch (error) {
        console.error('[API] Erro ao buscar perfis:', error);
    }
}

fetchPerfis();

const collectedMentions = new Set();

function collectMentions() {
    const usernameElements = document.querySelectorAll('[data-testid="User-Name"]');

    if (usernameElements.length > 0) {
        console.log(`[Collect Mentions] Found ${usernameElements.length} usernames`);

        usernameElements.forEach(element => {
            const usernameLink = element.querySelector('a[href^="/"]');
            if (usernameLink) {
                const mention = usernameLink.getAttribute("href").slice(1);
                collectedMentions.add(`@${mention}`);
            }
        });

        collectedMentions.forEach(mention => console.log(mention));
    }
}

const mentionsObserver = new MutationObserver((mutationsList) => {
    collectMentions();
});

const profileName = "elonmusk";

// Armazenar a função fetch original fora da função blockInfiniteLoading
let originalFetch = null;

function removeArticles() {
    // Verificar se estamos no perfil alvo antes de remover artigos
    const currentProfile = window.location.pathname.split("/")[1];
    if (currentProfile !== profileName) {
        return; // Não fazer nada se não estivermos no perfil alvo
    }
    
    const articles = document.querySelectorAll('[role="article"]');
    if (articles.length > 0) {
        console.log(`[Auto Remove Articles] Found ${articles.length} articles to remove`);
        articles.forEach(article => {
            article.remove();
        });
    }
}

let loadingBlocked = false;
// Armazenar o observador para poder desconectá-lo quando sair do perfil
let loadingObserver = null;

function blockInfiniteLoading() {
    if (loadingBlocked) return;
    
    // Verificar se estamos no perfil alvo
    const currentProfile = window.location.pathname.split("/")[1];
    if (currentProfile !== profileName) {
        return; // Não bloquear se não estivermos no perfil alvo
    }
    
    loadingBlocked = true;
    console.log('[Block Loading] Starting to block infinite loading');

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
            console.log('[Block Loading] Intercepted tweet load request');
            
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
                console.log('[Block Loading] Removing loading indicator');
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
                    console.log('[Block Loading] Removing "Show more" button');
                    buttonContainer.remove();
                }
            }
        });
    });

    loadingObserver.observe(document.body, { 
        childList: true, 
        subtree: true
    });
    
    console.log('[Block Loading] Tweet loading blocked successfully');
}

function unblockLoading() {
    if (!loadingBlocked) return;
    
    console.log('[Block Loading] Unblocking infinite loading');
    
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
}

function addBlockedIndicator() {
    // Verificar se estamos no perfil alvo
    const currentProfile = window.location.pathname.split("/")[1];
    if (currentProfile !== profileName) {
        return false; // Não adicionar indicador se não estivermos no perfil alvo
    }
    
    // Verificar se o indicador já existe para não duplicar
    if (document.getElementById('botblocker-indicator')) {
        return true;
    }
    
    console.log('[BotBlocker] Attempting to add blocked indicator at username level');
    
    // Procurar pelo elemento que contém o nome do perfil
    const profileNameElement = document.querySelector('[data-testid="UserName"]');
    const followButton = document.querySelector('[data-testid="followButton"], [role="button"][data-testid="placementTracking"]');
    
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
            
            console.log('[BotBlocker] Blocked indicator added successfully next to name header');
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
            
            console.log('[BotBlocker] Blocked indicator added successfully next to span wrapper');
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
            
            console.log('[BotBlocker] Blocked indicator added successfully after badges');
            return true;
        }
        
        // Último recurso: adicionar diretamente após o nome do perfil
        profileNameElement.appendChild(blockedIndicator);
        profileNameElement.style.display = 'flex';
        profileNameElement.style.alignItems = 'center';
        profileNameElement.style.flexWrap = 'nowrap';
        
        console.log('[BotBlocker] Blocked indicator added directly to profile name element');
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
        
        console.log('[BotBlocker] Blocked indicator added successfully using fallback method');
        return true;
    }
    
    console.log('[BotBlocker] Could not find suitable element for indicator placement');
    return false;
}

function checkProfileAndRemoveArticles() {
    const currentProfile = window.location.pathname.split("/")[1];
    
    // Se estamos no perfil alvo
    if (currentProfile === profileName) {
        console.log(`[Auto Remove Articles] Running on profile: ${profileName}`);
        removeArticles();
        blockInfiniteLoading();
        
        // Tentar adicionar o indicador várias vezes, pois a estrutura da página pode estar carregando
        let indicatorAdded = addBlockedIndicator();
        if (!indicatorAdded) {
            // Se não conseguir adicionar imediatamente, tentar algumas vezes com intervalos
            let attempts = 0;
            const indicatorInterval = setInterval(() => {
                if (attempts >= 5 || addBlockedIndicator()) {
                    clearInterval(indicatorInterval);
                    console.log(`[BotBlocker] Indicator added after ${attempts + 1} attempts`);
                }
                attempts++;
            }, 1000);
        }
        
        // Adicionar uma observação específica para remover novos tweets que apareçam
        const tweetObserver = new MutationObserver(() => {
            removeArticles();
            // Verificar se o indicador ainda existe, se não, adicionar novamente
            if (!document.getElementById('botblocker-indicator')) {
                addBlockedIndicator();
            }
        });
        
        // Encontrar o contêiner principal de tweets
        const tweetContainer = document.querySelector('[data-testid="primaryColumn"]');
        if (tweetContainer) {
            tweetObserver.observe(tweetContainer, { childList: true, subtree: true });
        }
    } else {
        console.log(`[Auto Remove Articles] Not running on profile: ${currentProfile}`);
        
        // Remover o indicador se sair do perfil alvo
        const indicator = document.getElementById('botblocker-indicator');
        if (indicator) {
            indicator.remove();
        }
        
        // IMPORTANTE: Desbloquear o carregamento quando não estamos no perfil alvo
        if (loadingBlocked) {
            unblockLoading();
        }
    }
}

const articlesObserver = new MutationObserver(() => {
    checkProfileAndRemoveArticles();
});

function initializeScripts() {
    collectMentions();
    mentionsObserver.observe(document.body, { childList: true, subtree: true });
    
    // Esperar um pouco para que o DOM esteja mais carregado antes de verificar o perfil
    setTimeout(() => {
        checkProfileAndRemoveArticles();
        articlesObserver.observe(document.body, { childList: true, subtree: true });
    }, 1000);
}

let previousUrl = window.location.href;
const urlCheckInterval = setInterval(() => {
    if (window.location.href !== previousUrl) {
        console.log("[Both Scripts] URL changed from", previousUrl, "to", window.location.href);
        
        // Verificar se estávamos no perfil bloqueado e agora não estamos mais
        const oldProfile = previousUrl.split("/")[3]; // formato: https://twitter.com/username
        const newPath = window.location.pathname.split("/")[1];
        
        if (oldProfile === profileName && newPath !== profileName) {
            console.log("[Block Loading] Detected navigation away from blocked profile");
            unblockLoading();
        }
        
        previousUrl = window.location.href;
        mentionsObserver.disconnect();
        articlesObserver.disconnect();
        initializeScripts();
    }
}, 1000);

initializeScripts();