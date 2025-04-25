const waitForImage = setInterval(() => {
    const image = document.querySelector('img[alt="Opens profile photo"]');
    if (image) {
      console.log("Image found:", image.src);
  
      // Save it to chrome.storage.local so your React popup can access it
      chrome.storage.local.set({ avatarUrl: image.src });
  
      clearInterval(waitForImage);
    }
  }, 500);
  
  function detectProfileImage() {
    const avatarImgs = document.querySelectorAll('img.css-9pa8cd');
  
    for (const img of avatarImgs) {
      const alt = img.getAttribute("alt")?.toLowerCase();
      const src = img.getAttribute("src");
  
      // Verifica se o alt indica que é uma imagem de perfil
      if (alt && src && alt.includes("profile photo")) {
        chrome.storage.local.set({ avatarUrl: src });
        return;
      }
    }
  }
  
  
  // Detect changes on the page (SPA navigation)
  const observer2 = new MutationObserver(() => {
    detectProfileImage();
  });
  
  observer2.observe(document.body, {
    childList: true,
    subtree: true,
  });
  
  detectProfileImage();
  

console.log("[Collect Mentions] Content script loaded and running");

// Variável para armazenar os perfis da API
let perfisDaAPI = [];
// Armazenar perfis bloqueados para não repetir o bloqueio
let perfisBlockeados = new Set();

// Global arrays to store blocked profiles
let profilesBlockedAutomatically = [];
let profilesBlockedManually = [];
let profilesBlockedByBadge = [];

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

    if (request.action === "blockProfileManually") {
        console.log(`[BotBlocker] Manual block request for profile: ${request.username} on ${request.platform}`);

        // Add to the set of blocked profiles
        perfisBlockeados.add(request.username);

        // Check if we're currently viewing this profile
        const currentProfile = window.location.pathname.split("/")[1];
        if (currentProfile.toLowerCase() === request.username.toLowerCase()) {
            console.log(`[BotBlocker] Currently viewing this profile. Applying blocking...`);
            removeArticles(request.username);
            blockInfiniteLoading(request.username);
            addBlockedIndicator(request.username);
        }

        // Apply blur to any tweets from this user in the timeline
        // applyBlurToAllTweetsFromUser(request.username);

        sendResponse({ success: true });
    }

    if (request.action === "unblockProfileManually") {
        console.log(`[BotBlocker] Manual unblock request for profile: ${request.username} on ${request.platform}`);

        // Remover do conjunto de perfis bloqueados
        perfisBlockeados.delete(request.username);

        // Verificar se estamos visualizando este perfil
        const currentProfile = window.location.pathname.split("/")[1];
        if (currentProfile.toLowerCase() === request.username.toLowerCase()) {
            console.log(`[BotBlocker] Currently viewing this profile. Applying unblocking...`);

            // Restaurar carregamento normal
            unblockLoading();

            // Remover o indicador de bloqueio se existir
            const indicator = document.getElementById('botblocker-indicator');
            if (indicator) {
                indicator.remove();
            }

            // Recarregar a página automaticamente para restaurar os tweets
            window.location.reload();
        }

        // Remover blur de todos os tweets deste usuário
        removeBlurFromUserTweets(request.username);

        sendResponse({ success: true });
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
                collectedMentions.add(mention);

                // Coletar a foto de perfil
                const profileImage = element.closest('[role="article"]')?.querySelector(`[data-testid="UserAvatar-Container-${mention}"] img`);
                if (profileImage) {
                    const profileImageUrl = profileImage.getAttribute("src");
                    if (profileImageUrl) {
                        // Atualizar o storage com a foto do perfil
                        chrome.storage.local.get(['blockedAccounts', 'profileImages'], (result) => {
                            const blockedAccounts = result.blockedAccounts || {
                                profilesBlockedAutomatically: [],
                                profilesBlockedManually: [],
                                profilesBlockedByBadge: []
                            };
                            
                            // Criar ou atualizar o objeto de imagens de perfil
                            const profileImages = result.profileImages || {};
                            profileImages[mention] = profileImageUrl;

                            // Atualizar a foto em todos os arrays de perfis bloqueados
                            const updateProfileImage = (profiles) => {
                                return profiles.map(p => {
                                    if (p.username === mention) {
                                        return { ...p, profileImage: profileImageUrl };
                                    }
                                    return p;
                                });
                            };

                            blockedAccounts.profilesBlockedAutomatically = updateProfileImage(blockedAccounts.profilesBlockedAutomatically);
                            blockedAccounts.profilesBlockedManually = updateProfileImage(blockedAccounts.profilesBlockedManually);
                            blockedAccounts.profilesBlockedByBadge = updateProfileImage(blockedAccounts.profilesBlockedByBadge);

                            // Salvar tanto os perfis bloqueados quanto as imagens de perfil
                            chrome.storage.local.set({ 
                                blockedAccounts,
                                profileImages 
                            });
                        });
                    }
                }

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
    const { settings, blackList } = await getSettingsAndBlacklist();
    const tolerance = settings.tolerance || 50; // Default value if not defined
    const badgeConfig = settings.badge || 'empty';

    // Create a Set for quick lookup of blacklisted profiles
    const manuallyBlockedSet = new Set(
        blackList.map(([username, platform]) => `${username.toLowerCase()}|${platform.toLowerCase()}`)
    );

    // Get the closest article element
    const articleContainer = element.tagName === 'ARTICLE' ? element : element.closest('[role="article"]');
    if (!articleContainer) return;

    // Check if this article contains a repost
    const repostText = articleContainer.textContent || '';
    const repostMatch = repostText.match(/(\w+)\s+reposted/i);

    // If we find something like "Elon Musk reposted"
    if (repostMatch && repostMatch[1]) {
        const reposter = repostMatch[1].toLowerCase();

        // Check if the reposter should be blocked
        const isManuallyBlocked = manuallyBlockedSet.has(`${reposter.toLowerCase()}|x`);
        
        // Verificar perfil na API
        const apiProfile = perfisDaAPI.find(p =>
            p.username.toLowerCase() === reposter.toLowerCase()
        );
        
        // Se o perfil tem badge "human", nunca deve ser bloqueado pela configuração de badge
        if (apiProfile && apiProfile.badge === 'human') {
            // Não bloquear e não borrar
            articleContainer.style.filter = 'none';
            removeBlockIndicatorFromTweet(articleContainer);
            return;
        }
        
        // Verificação por badge
        let shouldBlockByBadge = false;
        if (apiProfile) {
            const profileBadge = apiProfile.badge || 'empty';
            
            
            if (badgeConfig === 'bot' && profileBadge === 'bot') {
                shouldBlockByBadge = true;
            } else if (badgeConfig === 'without_verification' && profileBadge === 'empty') {
                shouldBlockByBadge = true;
            } else if (badgeConfig === 'bot_and_without_verification' && 
                     (profileBadge === 'empty' || profileBadge === 'bot')) {
                shouldBlockByBadge = true;
            }
        }
        
        // Verifica se deve bloquear por porcentagem
        const shouldBlockByPercentage = apiProfile && apiProfile.percentage > tolerance;
        
        const shouldBlockReposter = isManuallyBlocked || shouldBlockByPercentage || shouldBlockByBadge;

        if (shouldBlockReposter) {
            // Apply blur to the entire article
            articleContainer.style.filter = 'blur(5px)';
            articleContainer.style.transition = 'filter 0.3s ease';
            addBlockIndicatorToTweet(articleContainer);
            return; // No need to check anything else
        }


    }

    // Also check the original author by username
    const usernameLinks = articleContainer.querySelectorAll('a[href^="/"]');
    for (const link of usernameLinks) {
        const username = link.getAttribute('href').replace('/', '');
        if (username) {
            // Check if the profile should be blocked
            const isManuallyBlocked = manuallyBlockedSet.has(`${username.toLowerCase()}|x`);
            
            // Verificar perfil na API
            const apiProfile = perfisDaAPI.find(p =>
                p.username.toLowerCase() === username.toLowerCase()
            );
            
            // Se o perfil tem badge "human", nunca deve ser bloqueado pela configuração de badge
            if (apiProfile && apiProfile.badge === 'human') {
                // Não bloquear e não borrar
                articleContainer.style.filter = 'none';
                removeBlockIndicatorFromTweet(articleContainer);
                return;
            }
            
            // Verificação por badge
            let shouldBlockByBadge = false;
            if (apiProfile) {
                const profileBadge = apiProfile.badge || 'empty';
                
                if (badgeConfig === 'bot' && profileBadge === 'bot') {
                    shouldBlockByBadge = true;
                } else if (badgeConfig === 'without_verification' && profileBadge === 'empty') {
                    shouldBlockByBadge = true;
                } else if (badgeConfig === 'bot_and_without_verification' && 
                         (profileBadge === 'empty' || profileBadge === 'bot')) {
                    shouldBlockByBadge = true;
                }
            }
            
            // Verifica se deve bloquear por porcentagem
            const shouldBlockByPercentage = apiProfile && apiProfile.percentage > tolerance;
            
            const shouldBlock = isManuallyBlocked || shouldBlockByPercentage || shouldBlockByBadge;

            if (shouldBlock) {
                // Apply blur to the entire article
                articleContainer.style.filter = 'blur(5px)';
                articleContainer.style.transition = 'filter 0.3s ease';
                addBlockIndicatorToTweet(articleContainer);
                return; // We found it, no need to continue
            }
        }
    }

    // If we get here, we don't need to block
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
    try {
        return new Promise((resolve) => {
            chrome.storage.local.get(keys, resolve);
        });
    }
    catch (error) {
        setDefaultSettings();
    }
  }

  async function setDefaultSettings() {
    const settings = {
      tolerance: 50,
      badge: "empty",
    };
    const blackList = [];
    await setStorage({ settings, blackList});
  }

  function setStorage(obj) {
    return new Promise((resolve) => {
      chrome.storage.local.set(obj, resolve);
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



// Update the verifyAndBlockProfiles function in content.js

async function verifyAndBlockProfiles() {
    const { settings, blackList } = await getSettingsAndBlacklist();
    const tolerance = settings.tolerance || 50;
    const badgeConfig = settings.badge || 'empty';

    if (perfisDaAPI.length === 0) {
        console.log('[BotBlocker] No profiles from API to compare. Waiting for loading...');
        return;
    }

    console.log('[BotBlocker] Checking profiles for blocking...');
    console.log('%c[LOGS SOLICITADOS] Comparison of DOM vs. API profiles:', 'background: #8E44AD; color: white; padding: 2px 5px; border-radius: 3px;');
    console.log('Badge configuration:', badgeConfig);

    // Reset arrays
    profilesBlockedAutomatically = [];
    profilesBlockedManually = [];
    profilesBlockedByBadge = [];

  
    const profilesNotBlocked = [];
    const profilesOnlyInDOM = [];
    const profilesOnlyInAPI = [];

    const manuallyBlockedSet = new Set(
        blackList.map(([username, platform]) => `${username.toLowerCase()}|${platform.toLowerCase()}`)
    );

    collectedMentions.forEach(profileName => {
        const apiProfile = perfisDaAPI.find(p =>
            p.username.toLowerCase() === profileName.toLowerCase()
        );

        const isManuallyBlocked = manuallyBlockedSet.has(`${profileName.toLowerCase()}|x`);

        if (apiProfile) {
            const profileBadge = apiProfile.badge || 'empty';

            if (profileBadge === 'human') {
                return; // Ignorar "human"
            }

            let shouldBlockByBadge = false;
            if (badgeConfig === 'bot' && profileBadge === 'bot') {
                shouldBlockByBadge = true;
            } else if (badgeConfig === 'without_verification' && profileBadge === 'empty') {
                shouldBlockByBadge = true;
            } else if (badgeConfig === 'bot_and_without_verification' &&
                (profileBadge === 'bot' || profileBadge === 'empty')) {
                shouldBlockByBadge = true;
            }

            if (isManuallyBlocked) {
                profilesBlockedManually.push({
                    username: profileName,
                    percentage: apiProfile.percentage,
                    badge: profileBadge
                });
            } else if (shouldBlockByBadge) {
                profilesBlockedByBadge.push({
                    username: profileName,
                    percentage: apiProfile.percentage,
                    badge: profileBadge
                });
            } else if (apiProfile.percentage > tolerance) {
                profilesBlockedAutomatically.push({
                    username: profileName,
                    percentage: apiProfile.percentage,
                    badge: profileBadge
                });
            } else {
                profilesNotBlocked.push({
                    username: profileName,
                    percentage: apiProfile.percentage,
                    badge: profileBadge
                });
            }
        } else {
            // Simula perfil com badge 'empty' e percentage 0
            const simulatedBadge = 'empty';
            const simulatedPercentage = 0;

            if (isManuallyBlocked) {
                profilesBlockedManually.push({
                    username: profileName,
                    percentage: null,
                    badge: simulatedBadge
                });
            } else {
                let shouldBlockByBadge = false;
                if (badgeConfig === 'without_verification') {
                    shouldBlockByBadge = true;
                } else if (badgeConfig === 'bot_and_without_verification') {
                    shouldBlockByBadge = true;
                }

                if (shouldBlockByBadge) {
                    profilesBlockedByBadge.push({
                        username: profileName,
                        percentage: simulatedPercentage,
                        badge: simulatedBadge
                    });
                } else {
                    profilesOnlyInDOM.push(profileName);
                }
            }
        }
    });

    perfisDaAPI.forEach(apiProfile => {
        const foundInDOM = Array.from(collectedMentions).some(
            p => p.toLowerCase() === apiProfile.username.toLowerCase()
        );

        if (!foundInDOM) {
            profilesOnlyInAPI.push({
                username: apiProfile.username,
                percentage: apiProfile.percentage,
                badge: apiProfile.badge || 'empty'
            });
        }
    });

    // Mostrar os resultados
    console.log('%c1. Profiles automatically blocked (percentage > tolerance):', 'color: #8E44AD; font-weight: bold;');
    profilesBlockedAutomatically.forEach(p => {
        console.log(`%c   - @${p.username} (${p.percentage}%, badge: ${p.badge})`, 'color: #FF3A3A; font-weight: bold;');
    });

    console.log('%c2. Profiles manually blocked:', 'color: #8E44AD; font-weight: bold;');
    profilesBlockedManually.forEach(p => {
        console.log(`%c   - @${p.username} ${p.percentage ? `(${p.percentage}%, badge: ${p.badge})` : ''}`, 'color: #E74C3C; font-weight: bold;');
    });

    console.log('%c3. Profiles blocked by badge configuration:', 'color: #8E44AD; font-weight: bold;');
    profilesBlockedByBadge.forEach(p => {
        console.log(`%c   - @${p.username} (${p.percentage}%, badge: ${p.badge})`, 'color: #9B59B6; font-weight: bold;');
    });

    console.log('%c4. Profiles not blocked (percentage <= tolerance, badge not blocked):', 'color: #8E44AD; font-weight: bold;');
    profilesNotBlocked.forEach(p => {
        console.log(`%c   - @${p.username} (${p.percentage}%, badge: ${p.badge})`, 'color: #3498DB;');
    });

    console.log('%c5. Profiles only in DOM (Not in API):', 'color: #8E44AD; font-weight: bold;');
    profilesOnlyInDOM.forEach(p => {
        console.log(`%c   - @${p}`, 'color: #27AE60;');
    });

    console.log('%c6. Profiles only in API (Not in current DOM):', 'color: #8E44AD; font-weight: bold;');
    profilesOnlyInAPI.forEach(p => {
        const style = p.percentage > tolerance ? 'color: #E67E22;' : 'color: #7F8C8D;';
        console.log(`%c   - @${p.username} (${p.percentage}%, badge: ${p.badge})`, style);
    });

    // Parte final: aplicar o bloqueio
    collectedMentions.forEach(profileName => {
        if (perfisBlockeados.has(profileName)) return;

        const isBlacklisted = blackList.some(([user, platform]) =>
            user.toLowerCase() === profileName.toLowerCase() && platform === 'twitter'
        );
        if (isBlacklisted) {
            console.log(`[BotBlocker] Perfil ${profileName} está na blacklist. A bloquear...`);
            blockProfile(profileName);
            perfisBlockeados.add(profileName);
            return;
        }

        const isManuallyBlocked = manuallyBlockedSet.has(`${profileName.toLowerCase()}|x`);
        if (isManuallyBlocked) {
            console.log(`[BotBlocker] Profile ${profileName} is manually blocked. Blocking...`);
            blockProfile(profileName);
            perfisBlockeados.add(profileName);
            return;
        }

        const foundProfile = perfisDaAPI.find(p =>
            p.username.toLowerCase() === profileName.toLowerCase()
        );
        const apiProfile = foundProfile || { username: profileName, badge: 'empty', percentage: 0 };

        if (apiProfile.badge === 'human') return;

        let shouldBlockByBadge = false;
        if (badgeConfig === 'bot' && apiProfile.badge === 'bot') {
            shouldBlockByBadge = true;
        } else if (badgeConfig === 'without_verification' && apiProfile.badge === 'empty') {
            shouldBlockByBadge = true;
        } else if (badgeConfig === 'bot_and_without_verification' &&
            (apiProfile.badge === 'bot' || apiProfile.badge === 'empty')) {
            shouldBlockByBadge = true;
        }

        if (shouldBlockByBadge) {
            console.log(`[BotBlocker] Profile ${profileName} has badge '${apiProfile.badge}' which matches blocking config '${badgeConfig}'. Blocking...`);
            blockProfile(profileName);
            perfisBlockeados.add(profileName);
            return;
        }

        if (apiProfile.percentage > tolerance) {
            console.log(`[BotBlocker] Profile ${profileName} found in API with percentage ${apiProfile.percentage}%. Automatically blocking...`);
            blockProfile(profileName);
            perfisBlockeados.add(profileName);
        }
    });

    // After processing all profiles, update storage
    updateBlockedAccountsStorage();
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
        // Estamos na página do perfil - bloquear completamente
        removeArticles(profileName);
        blockInfiniteLoading(profileName);
        addBlockedIndicator(profileName);
    } else {
        // Estamos no feed - apenas aplicar blur aos tweets deste usuário
        applyBlurToAllTweetsFromUser(profileName);
    }

    // After blocking, update storage
    updateBlockedAccountsStorage();
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
        // console.log(`[BotBlocker] Blocked indicator already exists for ${profileName}`);
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
    const badgeConfig = settings.badge || 'empty'; // Configuração de badge
    const currentProfile = window.location.pathname.split("/")[1];

    // Verificar se o perfil atual está na lista de perfis para bloquear
    if (perfisDaAPI.length > 0) {
        const perfilAPI = perfisDaAPI.find(p => p.username.toLowerCase() === currentProfile.toLowerCase());
        const isManuallyBlocked = blackList.some(([username, platform]) =>
            username.toLowerCase() === currentProfile.toLowerCase() && platform.toLowerCase() === 'x'
        );
        
        // Verificação por badge
        let shouldBlockByBadge = false;
        if (perfilAPI) {
            const profileBadge = perfilAPI.badge || 'empty';
            
            if (badgeConfig === 'bot' && profileBadge === 'bot') {
                shouldBlockByBadge = true;
            } else if (badgeConfig === 'without_verification' && profileBadge === 'empty') {
                shouldBlockByBadge = true;
            } else if (badgeConfig === 'bot_and_without_verification' && 
                     (profileBadge === 'empty' || profileBadge === 'bot')) {
                shouldBlockByBadge = true;
            }
        }

        // se o currentProfile for o homepage, não aplicar bloqueio
        if (currentProfile === 'home') {
            console.log(`[BotBlocker] Current profile is home. Not applying block...`);
            return;
        }

        if ((perfilAPI && perfilAPI.percentage > tolerance) || isManuallyBlocked || shouldBlockByBadge) {
            // Log diferente dependendo do tipo de bloqueio
            if (isManuallyBlocked) {
                console.log(`[BotBlocker] Perfil atual ${currentProfile} está manualmente bloqueado. Bloqueando...`);
            } else if (shouldBlockByBadge && perfilAPI) {
                console.log(`[BotBlocker] Perfil atual ${currentProfile} com badge '${perfilAPI.badge || 'empty'}' corresponde à configuração de bloqueio '${badgeConfig}'. Bloqueando...`);
            } else if (perfilAPI) {
                console.log(`[BotBlocker] Perfil atual ${currentProfile} encontrado na API com percentage ${perfilAPI.percentage}%. Bloqueando...`);
            }

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


// Function to apply blur to all tweets from a specific user
function applyBlurToAllTweetsFromUser(username) {
    console.log(`[BotBlocker] Applying blur to all tweets from ${username}`);

    // Find all tweets in the timeline
    const articles = document.querySelectorAll('[role="article"]');

    articles.forEach(article => {
        const usernameLinks = article.querySelectorAll('a[href^="/"]');

        for (const link of usernameLinks) {
            const linkUsername = link.getAttribute('href').replace('/', '');

            if (linkUsername.toLowerCase() === username.toLowerCase()) {
                // Apply blur to this tweet
                article.style.filter = 'blur(5px)';
                article.style.transition = 'filter 0.3s ease';
                addBlockIndicatorToTweet(article);
                break;
            }
        }
    });
}

// Function to update blocked accounts in storage
async function updateBlockedAccountsStorage() {
    // Get current blocked accounts from storage
    chrome.storage.local.get(['blockedAccounts', 'profileImages'], (result) => {
        const blockedAccounts = {
            profilesBlockedAutomatically: profilesBlockedAutomatically.map(p => {
                // Tentar encontrar a foto de perfil no DOM primeiro
                const profileImage = document.querySelector(`[data-testid="UserAvatar-Container-${p.username}"] img`);
                const profileImageUrl = profileImage?.getAttribute("src");
                
                // Se não encontrar no DOM, usar a imagem armazenada
                const storedImage = result.profileImages?.[p.username];
                
                return {
                    username: p.username,
                    percentage: p.percentage,
                    badge: p.badge || 'unknown',
                    name: p.name || p.username,
                    profileImage: profileImageUrl || storedImage || p.profileImage
                };
            }),
            profilesBlockedManually: profilesBlockedManually.map(p => {
                const profileImage = document.querySelector(`[data-testid="UserAvatar-Container-${p.username}"] img`);
                const profileImageUrl = profileImage?.getAttribute("src");
                const storedImage = result.profileImages?.[p.username];
                
                return {
                    username: p.username,
                    percentage: p.percentage,
                    badge: p.badge || 'unknown',
                    name: p.name || p.username,
                    profileImage: profileImageUrl || storedImage || p.profileImage
                };
            }),
            profilesBlockedByBadge: profilesBlockedByBadge.map(p => {
                const profileImage = document.querySelector(`[data-testid="UserAvatar-Container-${p.username}"] img`);
                const profileImageUrl = profileImage?.getAttribute("src");
                const storedImage = result.profileImages?.[p.username];
                
                return {
                    username: p.username,
                    percentage: p.percentage,
                    badge: p.badge || 'unknown',
                    name: p.name || p.username,
                    profileImage: profileImageUrl || storedImage || p.profileImage
                };
            })
        };

        // Save updated list
        chrome.storage.local.set({ blockedAccounts });
    });
}

function removeBlurFromUserTweets(username) {
    console.log(`[BotBlocker] Removing blur from tweets by ${username}`);

    // Encontrar todos os tweets na timeline
    const articles = document.querySelectorAll('[role="article"]');

    articles.forEach(article => {
        const usernameLinks = article.querySelectorAll('a[href^="/"]');

        for (const link of usernameLinks) {
            const linkUsername = link.getAttribute('href').replace('/', '');

            if (linkUsername.toLowerCase() === username.toLowerCase()) {
                // Remover blur deste tweet
                article.style.filter = 'none';
                removeBlockIndicatorFromTweet(article);
                break;
            }
        }
    });
}
