// content.js - Adaptado para suportar múltiplas redes sociais

// Detectar imagem de perfil
const waitForImage = setInterval(() => {
  const image = document.querySelector('img[alt="Opens profile photo"]');
  if (image) {

    // Save it to chrome.storage.local so your React popup can access it
    chrome.storage.local.set({ avatarUrl: image.src });

    clearInterval(waitForImage);
  }
}, 500);

// Função para detectar a plataforma atual
function detectCurrentPlatform() {
  const url = window.location.href;
  
  if (url.includes('twitter.com') || url.includes('x.com')) {
    return 'x';
  } else if (url.includes('instagram.com')) {
    return 'instagram';
  } else if (url.includes('facebook.com')) {
    return 'facebook';
  }

  return 'unknown';
}


// Variáveis globais
let perfisDaAPI = [];
let perfisBlockeados = new Set();
let currentPlatform = detectCurrentPlatform();

let profilesBlockedAutomatically = [];
let profilesBlockedManually = [];
let profilesBlockedByBadge = [];

let instagramProfileBlocked = false;
let lastBlockedInstagramProfile = null;  // Guarda nome do perfil bloqueado



// Armazenar a função fetch original
let originalFetch = null;
// Observador para loading
let loadingObserver = null;
// Perfil atualmente bloqueado
let currentBlockedProfile = null;
let loadingBlocked = false;
let collectedMentions = new Set();


async function convertImageToDataURL(url) {
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
  
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("[BotBlocker] Erro ao converter imagem para DataURL:", err);
      return null;
    }
}

// Função para detectar imagem de perfil baseada na plataforma
async function detectProfileImage() {
  const platform = detectCurrentPlatform();
  
  if (platform === 'x') {
    const avatarImgs = document.querySelectorAll('img.css-9pa8cd');
  
    for (const img of avatarImgs) {
      const alt = img.getAttribute("alt")?.toLowerCase();
      const src = img.getAttribute("src");
  
      // Verifica se o alt indica que é uma imagem de perfil
      if (alt && src && alt.includes("profile photo")) {
        chrome.storage.local.set({ avatarUrl: src });
        return src;
      }
    }
  } else if (platform === 'instagram') {
    // Implementação para Instagram (exemplo)
        const imgs = document.querySelectorAll('img');

        for (const img of imgs) {
        const alt = img.getAttribute("alt")?.toLowerCase();
        const src = img.getAttribute("src");

        if (alt && src && alt.includes("foto de perfil de")) {
            const dataUrl = await convertImageToDataURL(src);

            if (dataUrl) {
            chrome.storage.local.set({ avatarUrl: dataUrl });

            return dataUrl;
            } else {

            }
        }
        }
    } else if (platform === 'facebook') {
    // Procura um <svg> com <image> dentro
      const mainContent = document.querySelector('div[role="main"]');

      if (!mainContent) {
        console.warn("[BotBlocker] Conteúdo principal não encontrado.");
        return null;
      }

      const svgImages = mainContent.querySelectorAll('svg[aria-label] image');

      for (const image of svgImages) {
        const href = image.getAttribute('xlink:href') || image.getAttribute('href');
        if (href && href.includes("facebook.com")) continue; // ignora imagens de ícones

        // Heurística extra: verifica se a imagem é quadrada e suficientemente grande
        const height = parseInt(image.getAttribute("height") || "0");
        const width = parseInt(image.getAttribute("width") || "0");
        if (height >= 100 && width >= 100) {
          chrome.storage.local.set({ avatarUrl: href });

          return href;
        }
      }


    }
  return null;
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

// Função para obter perfil atual com base na plataforma
function getCurrentProfile() {
  const platform = detectCurrentPlatform();
  
  if (platform === 'x') {
    // Twitter/X: o perfil é o primeiro segmento do caminho
    const currentProfile = window.location.pathname.split("/")[1];
    return {
      url: window.location.href,
      profile: currentProfile,
      platform: 'x'
    };
  } else if (platform === 'instagram') {
    // Instagram: também é o primeiro segmento
    const segments = window.location.pathname.split('/').filter(s => s);
    const currentProfile = segments.length > 0 ? segments[0] : '';
    return {
      url: window.location.href,
      profile: currentProfile,
      platform: 'instagram'
    };
  } else if (platform === 'facebook') {
    const segments = window.location.pathname.split('/').filter(s => s);
    const currentProfile = segments.length > 0 ? segments[0] : '';
    return {
      url: window.location.href,
      profile: currentProfile,
      platform: 'facebook'
    };
  }
  
  return {
    url: window.location.href,
    profile: '',
    platform: 'unknown'
  };
}

// Processamento de mensagens
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCurrentProfile") {
    const profileInfo = getCurrentProfile();

    // Find if this profile is in the API data
    const profileData = perfisDaAPI.find(p =>
      p.username && p.username.toLowerCase() === profileInfo.profile.toLowerCase()
    );

    profileInfo.apiData = profileData || null;
    sendResponse(profileInfo);
  }

  if (request.action === "blockProfileManually") {


    // Add to the set of blocked profiles
    perfisBlockeados.add(request.username);

    // Block the profile on the specific platform
    blockProfile(request.username, request.platform);

    sendResponse({ success: true });
  }

  if (request.action === "unblockProfileManually") {


    // Remover do conjunto de perfis bloqueados
    perfisBlockeados.delete(request.username);

    // Unblock the profile on the specific platform
    unblockProfile(request.username, request.platform);

    sendResponse({ success: true });
  }

  return true;
});

// Função para buscar perfis da API
async function fetchPerfis() {
  return new Promise((resolve, reject) => {
    try {


      // Send message to background script
      chrome.runtime.sendMessage({action: "fetchProfiles"}, (response) => {
        if (response && response.success) {
          perfisDaAPI = response.profiles;


          // Log the profiles loaded for debugging
          if (perfisDaAPI.length > 0) {

            perfisDaAPI.slice(0, 3).forEach(profile => {

            });
          }

          resolve(perfisDaAPI);
        } else {

          perfisDaAPI = []; // Fallback para array vazio
          resolve([]); // Resolve com array vazio em caso de erro
        }
      });
    } catch (error) {

      perfisDaAPI = []; // Fallback para array vazio
      reject(error);
    }
  });
}

// Função para coletar menções com base na plataforma
function collectMentions() {
  const platform = detectCurrentPlatform();
  let newProfilesFound = [];
  
  if (platform === 'x') {
    // Implementação Twitter/X
    const usernameElements = document.querySelectorAll('[data-testid="User-Name"]');
    
    usernameElements.forEach(element => {
      const usernameLink = element.querySelector('a[href^="/"]');
      if (usernameLink) {
        const mention = usernameLink.getAttribute("href").slice(1);
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
  } else if (platform === 'instagram') {
    // Implementação mais robusta para Instagram
    const usernameElements = document.querySelectorAll('a[href^="/"]:not([href="/"])');
    
    usernameElements.forEach(element => {
      const href = element.getAttribute('href');
      const match = href.match(/^\/([^\/]+)/);
      
      if (match && match[1]) {
        const mention = match[1];
        
        // Ignorar links que claramente não são perfis
        if (mention.startsWith('#') || mention === 'explore' || mention === 'reels') return;
        
        if (!collectedMentions.has(mention)) {

          newProfilesFound.push(mention);
        }
        
        collectedMentions.add(mention);
      }
    });
  } else if (platform === 'facebook') {
    // --- 1. Aria-labels de links (ex: "História de Universidade de Aveiro") ---
    const ariaLinks = document.querySelectorAll('a[aria-label]');
    ariaLinks.forEach(link => {
      const label = link.getAttribute('aria-label')?.trim();
      if (!label) return;

      const match = label.match(/História de (.+)/i);
      if (match && match[1]) {
        const name = match[1].trim();
        const normalized = name.replace(/\s+/g, '');

        if (!collectedMentions.has(normalized)) {

          newProfilesFound.push(normalized);
          collectedMentions.add(normalized);
        }
      }
    });

    // --- 2. Imagens com alt (limitar a texto curto e sem símbolos estranhos) ---
    const imgElements = document.querySelectorAll('img[alt]');
    imgElements.forEach(img => {
      const alt = img.getAttribute('alt')?.trim();
      if (!alt || alt.length < 3 || alt.length > 40) return;
      if (/[^A-Za-zÀ-ÿ0-9\s'.-]/.test(alt)) return; // evita emojis ou símbolos

      const isInsideStoryOrFeed = img.closest('a[href*="/stories/"]') || img.closest('div[data-pagelet^="FeedUnit_"]');
      if (!isInsideStoryOrFeed) return;

      const normalized = alt.replace(/\s+/g, '');

      if (!collectedMentions.has(normalized)) {

        newProfilesFound.push(normalized);
        collectedMentions.add(normalized);
      }
    });

    // --- 3. Texto visível dentro de posts (pareça nome real, e esteja dentro do feed) ---
    const spanElements = document.querySelectorAll('span');
    spanElements.forEach(span => {
      const text = span.textContent?.trim();
      if (!text || text.length < 4 || text.length > 40) return;

      const looksLikeName = /^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÀÇ][A-Za-zÀ-ÿ\s'.-]+$/.test(text);
      const isInsideFeed = span.closest('div[data-pagelet^="FeedUnit_"]');

      if (looksLikeName && isInsideFeed) {
        const normalized = text.replace(/\s+/g, '');

        if (!collectedMentions.has(normalized)) {

          newProfilesFound.push(normalized);
          collectedMentions.add(normalized);
        }
      }
    });
  }





  
  // Log dos novos perfis encontrados
  if (newProfilesFound.length > 0) {

    newProfilesFound.forEach(perfil => {

    });
  }

  // Log de todos os perfis coletados até agora
  if (collectedMentions.size > 0) {

    const perfisList = Array.from(collectedMentions);
    perfisList.sort();
    perfisList.forEach(perfil => {

    });
  }

  // Depois de coletar os perfis, verificar quais precisam ser bloqueados
  verifyAndBlockProfiles();

  return collectedMentions;
}

// Função auxiliar para verificar bloqueio baseado em badge
function shouldBlockByBadge(apiProfile, badgeConfig) {
  if (!apiProfile) return false;
  
  const profileBadge = apiProfile.badge || 'empty';
  
  if (badgeConfig === 'bot' && profileBadge === 'bot') {
    return true;
  } else if (badgeConfig === 'without_verification' && profileBadge === 'empty') {
    return true;
  } else if (badgeConfig === 'bot_and_without_verification' && 
           (profileBadge === 'empty' || profileBadge === 'bot')) {
    return true;
  }
  
  return false;
}

// Função para verificar se um tweet deve ser bloqueado
function shouldBlockTwitterPost(articleContainer, username, manuallyBlockedSet, tolerance, badgeConfig) {
  // Verificar repost
  const repostText = articleContainer.textContent || '';
  const repostMatch = repostText.match(/(\w+)\s+reposted/i);
  
  if (repostMatch && repostMatch[1]) {
    const reposter = repostMatch[1].toLowerCase();
    
    // Check if the reposter should be blocked
    const isManuallyBlocked = manuallyBlockedSet.has(`${reposter.toLowerCase()}|x`);
    const apiProfile = perfisDaAPI.find(p => p.username.toLowerCase() === reposter.toLowerCase());
    
    // Se o perfil tem badge "human", nunca deve ser bloqueado
    if (apiProfile && apiProfile.badge === 'human') {
      return false;
    }
    
    // Verificação por badge
    const shouldBlockByBadgeResult = shouldBlockByBadge(apiProfile, badgeConfig);
    
    // Verifica se deve bloquear por porcentagem
    const shouldBlockByPercentage = apiProfile && apiProfile.percentage > tolerance;
    
    return isManuallyBlocked || shouldBlockByPercentage || shouldBlockByBadgeResult;
  }
  
  // Verificar links de usuário
  const usernameLinks = articleContainer.querySelectorAll('a[href^="/"]');
  for (const link of usernameLinks) {
    const linkUsername = link.getAttribute('href').replace('/', '');
    if (linkUsername) {
      const isManuallyBlocked = manuallyBlockedSet.has(`${linkUsername.toLowerCase()}|x`);
      const apiProfile = perfisDaAPI.find(p => p.username.toLowerCase() === linkUsername.toLowerCase());
      
      if (apiProfile && apiProfile.badge === 'human') {
        return false;
      }
      
      const shouldBlockByBadgeResult = shouldBlockByBadge(apiProfile, badgeConfig);
      const shouldBlockByPercentage = apiProfile && apiProfile.percentage > tolerance;
      
      if (isManuallyBlocked || shouldBlockByPercentage || shouldBlockByBadgeResult) {
        return true;
      }
    }
  }
  
  return false;
}

// Função para aplicar blur a tweets
async function applyBlurToTweet(element, mention) {
  const { settings, blackList } = await getSettingsAndBlacklist();
  const tolerance = settings.tolerance || 50;
  const badgeConfig = settings.badge || 'empty';
  const platform = detectCurrentPlatform();

  // Create a Set for quick lookup of blacklisted profiles
  const manuallyBlockedSet = new Set(
    blackList.map(([username, blockedPlatform]) => `${username.toLowerCase()}|${blockedPlatform.toLowerCase()}`)
  );

  if (platform === 'x') {
    // Implementação para Twitter/X
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
        chrome.storage.local.get(['remove_instead_of_blur'], (result) => {
          const shouldRemove = result.remove_instead_of_blur === true;
        
          if (shouldRemove) {
            articleContainer.remove();
          } else {
            articleContainer.style.filter = 'blur(5px)';
            articleContainer.style.transition = 'filter 0.3s ease';
            addBlockIndicatorToTweet(articleContainer);
          }
        });
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
          chrome.storage.local.get(['remove_instead_of_blur'], (result) => {
            const shouldRemove = result.remove_instead_of_blur === true;
          
            if (shouldRemove) {
              articleContainer.remove();
            } else {
              articleContainer.style.filter = 'blur(5px)';
              articleContainer.style.transition = 'filter 0.3s ease';
              addBlockIndicatorToTweet(articleContainer);
            }
          });
          return; // We found it, no need to continue
        }
      }
    }

    // If we get here, we don't need to block
    articleContainer.style.filter = 'none';
    removeBlockIndicatorFromTweet(articleContainer);
  } else if (platform === 'instagram') {
    // Implementação para Instagram (exemplo)
    const postContainer = element.closest('article');
    if (!postContainer) return;
    
    // Verificar se este post deve ser bloqueado
    const isManuallyBlocked = manuallyBlockedSet.has(`${mention.toLowerCase()}|instagram`);
    const apiProfile = perfisDaAPI.find(p => p.username && p.username.toLowerCase() === mention.toLowerCase());
    
    // Verificação por badge
    let shouldBlockByBadge = false;
    if (apiProfile && apiProfile.badge !== 'human') {
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
    
    const shouldBlockByPercentage = apiProfile && apiProfile.percentage > tolerance;
    
    if (isManuallyBlocked || shouldBlockByBadge || shouldBlockByPercentage) {
      // Apply blur to this post
      chrome.storage.local.get(['remove_instead_of_blur'], (result) => {
        const shouldRemove = result.remove_instead_of_blur === true;


        if (shouldRemove) {
          postContainer.remove();
        } else {
        postContainer.style.filter = 'blur(5px)';
        postContainer.style.transition = 'filter 0.3s ease';
        addBlockIndicatorToTweet(postContainer);
        }
        return;
      })
    }
    
    // If we don't need to block
    postContainer.style.filter = 'none';
    removeBlockIndicatorFromTweet(postContainer);
  }
}

// Função para adicionar indicador de bloqueio a tweets
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

// Função para remover indicador de bloqueio de tweets
function removeBlockIndicatorFromTweet(tweetElement) {
  const indicator = tweetElement.querySelector('.bot-blocker-tweet-indicator');
  if (indicator) {
    indicator.remove();
  }
}

// Adicionar estilos CSS
function addStyles() {
  const styles = `
    .bot-blocker-tweet-indicator,
    .bot-blocker-instagram-indicator,
    .bot-blocker-facebook-indicator {
      pointer-events: none;
      text-shadow: 0 0 5px rgba(255, 58, 58, 0.5);
    }
    
    #botblocker-indicator,
    #botblocker-indicator-instagram,
    #botblocker-indicator-facebook {
      background-color: #FF3A3A;
      color: white;
      padding: 4px 10px;
      border-radius: 4px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      z-index: 9999;
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

// Configurar settings padrão
async function setDefaultSettings() {
  const settings = {
    tolerance: 50,
    badge: "empty",
  };
  const blackList = [];
  await setStorage({ settings, blackList });
}

// Salvar no storage
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

// Função principal para verificar perfis e aplicar bloqueios
async function verifyAndBlockProfiles() {
  const platform = detectCurrentPlatform();
  if (platform === 'unknown') return;
  
  const { settings, blackList } = await getSettingsAndBlacklist();
  const tolerance = settings.tolerance || 50;
  const badgeConfig = settings.badge || 'empty';



  if (perfisDaAPI.length === 0) {

    return;
  }





    // Reset arrays


  profilesBlockedAutomatically = [];
  profilesBlockedManually = [];
  profilesBlockedByBadge = [];
  const profilesNotBlocked = [];
  const profilesOnlyInDOM = [];
  const profilesOnlyInAPI = [];

  const manuallyBlockedSet = new Set(
    blackList.map(([username, blockedPlatform]) => `${username.toLowerCase()}|${blockedPlatform.toLowerCase()}`)
  );

  collectedMentions.forEach(profileName => {
    const apiProfile = perfisDaAPI.find(p =>
      p.username && p.username.toLowerCase() === profileName.toLowerCase()
    );

    const isManuallyBlocked = manuallyBlockedSet.has(`${profileName.toLowerCase()}|${platform}`);

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
    if (!apiProfile.username) return;
    
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

  // Mostrar os resultados nos logs

  

  

  // Parte final: aplicar o bloqueio
  collectedMentions.forEach(profileName => {
    if (perfisBlockeados.has(profileName)) return;

    const isBlacklisted = blackList.some(([user, blockedPlatform]) =>
      user.toLowerCase() === profileName.toLowerCase() && blockedPlatform === platform
    );
    
    if (isBlacklisted) {

      blockProfile(profileName, platform);
      perfisBlockeados.add(profileName);
      return;
    }

    const isManuallyBlocked = manuallyBlockedSet.has(`${profileName.toLowerCase()}|${platform}`);
    if (isManuallyBlocked) {

      blockProfile(profileName, platform);
      perfisBlockeados.add(profileName);
      return;
    }

    const foundProfile = perfisDaAPI.find(p =>
      p.username && p.username.toLowerCase() === profileName.toLowerCase()
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

      blockProfile(profileName, platform);
      perfisBlockeados.add(profileName);
      return;
    }

    if (apiProfile.percentage > tolerance) {

      blockProfile(profileName, platform);
      perfisBlockeados.add(profileName);
    }
  });
  updateBlockedAccountsStorage();
}

// Função principal para bloquear um perfil em qualquer plataforma
function blockProfile(profileName, platform) {
    platform = platform || detectCurrentPlatform();
    

    
    // Verificar se estamos visualizando este perfil
    const currentProfileInfo = getCurrentProfile();
    
    if (platform === 'x') {
      // Implementação para Twitter/X
      if (currentProfileInfo.profile === profileName) {
        // Estamos na página do perfil - bloquear completamente
        removeArticles(profileName);
        blockInfiniteLoading(profileName);
        addBlockedIndicator(profileName);
      } else {
        // Estamos no feed - apenas aplicar blur aos tweets
        applyBlurToAllTweetsFromUser(profileName);
      }
    } else if (platform === 'instagram') {
      // Implementação para Instagram
      if (currentProfileInfo.profile === profileName) {
        // Estamos na página do perfil - implementar bloqueio para Instagram
        lastBlockedInstagramProfile = profileName; // nome do perfil bloqueado
        removePostsInstagram(profileName);
        blockScrollInstagram(profileName);
        addBlockedIndicatorInstagram(profileName);
      } else {
        // Estamos no feed - aplicar blur aos posts
        instagramProfileBlocked = profileName; // nome do perfil bloqueado
        lastBlockedInstagramProfile = profileName; // nome do perfil bloqueado
        applyBlurToAllPostsFromUserInstagram(profileName);
        blockStoryPreviewInFeed(profileName);
      }
    } else if (platform === 'facebook') {

      if (currentProfileInfo.profile === profileName) {

        removePostsFacebook(profileName);
        addBlockedIndicatorFacebook(profileName);

      }
      else {

        // Estamos no feed - aplicar blur aos posts
        applyBlurToAllPostsFromUserFacebook(profileName);
        blockStoryPreviewInFeedFacebook(profileName);
      }
    }
    updateBlockedAccountsStorage();
  }
  
  // Função para desbloquear um perfil
function unblockProfile(username, platform) {
  platform = platform || detectCurrentPlatform();



  if (platform === 'x') {
    const currentProfile = window.location.pathname.split("/")[1];
    if (currentProfile.toLowerCase() === username.toLowerCase()) {


      unblockLoading();

      const indicator = document.getElementById('botblocker-indicator');
      if (indicator) {
        indicator.remove();
      }

      window.location.reload();
    }

    removeBlurFromUserTweets(username);

  } else if (platform === 'instagram') {
    const currentProfile = getCurrentProfile().profile;
    if (currentProfile.toLowerCase() === username.toLowerCase()) {


      const styleElement = document.getElementById('botblocker-instagram-style');
      if (styleElement) {
        styleElement.remove();
      }

      const indicator = document.getElementById('botblocker-indicator-instagram');
      if (indicator) {
        indicator.remove();
      }

      window.location.reload();
    }

    removeBlurFromPostsInstagram(username);

  } else if (platform === 'facebook') {
    const currentPath = window.location.pathname;
    if (currentPath.includes(username)) {


      // Restaurar o fetch original, se tiver sido sobrescrito
      if (typeof originalFetch === 'function') {
        window.fetch = originalFetch;

      }

      // Parar o observer se estiver ativo
      if (loadingObserver) {
        loadingObserver.disconnect();

      }

      // Remover o indicador de bloqueio, se presente
      const indicator = document.getElementById('botblocker-facebook-indicator');
      if (indicator) {
        indicator.remove();
      }

      // Recarregar a página para repopular conteúdo
      window.location.reload();
    }
  }
}

  
  // Remover artigos do Twitter
  function removeArticles(profileName) {
    // Verificar se estamos no perfil alvo antes de remover artigos
    const currentProfile = window.location.pathname.split("/")[1];
    if (currentProfile !== profileName) {
      return; // Não fazer nada se não estivermos no perfil alvo
    }
  
    const articles = document.querySelectorAll('[role="article"]');
    if (articles.length > 0) {

      articles.forEach(article => {
        article.remove();
      });
    }
  }
  
  function removePostsInstagram(profileName) {

    
    // Remover posts no formato de grid
    function removeGridPosts() {
        const gridPosts = document.querySelectorAll('div[role="presentation"] img');
        gridPosts.forEach(post => {
            const postContainer = post.closest('div[role="presentation"]');
            if (postContainer) {
                postContainer.remove();
            }
        });
    }
    
    // Remover destaques (se tiver outro formato específico)
    function removeHighlights() {
        const highlights = document.querySelectorAll('div[class*="highlight"]');
        highlights.forEach(highlight => {
            highlight.remove();
        });
    }
    
    // Remover outros tipos de posts
    function removeOtherPosts() {
        const otherPosts = document.querySelectorAll('article');
        otherPosts.forEach(post => {
            post.remove();
        });
    }
    
    // Executar todas as remoções
    removeGridPosts();
    removeHighlights();
    removeOtherPosts();
    

}

function observePageChangeForFacebookUnblock(username) {
  const indicator = document.getElementById('botblocker-facebook-indicator');
  if (!indicator) return;

  let lastPath = window.location.pathname;

  const observer = new MutationObserver(() => {
    const currentPath = window.location.pathname;

    if (!currentPath.includes(username)) {


      observer.disconnect(); // Desliga antes do reload para evitar chamadas duplicadas
      history.go(0) // 🔁 Recarrega a página para restaurar o conteúdo
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });


}


function removePostsFacebook(profileName) {
  const currentPath = window.location.pathname;
  if (!currentPath.includes(profileName) || currentPath === '/') return;


  const mainContent = document.querySelector('div[role="main"]');
  if (mainContent) {
    mainContent.remove();

  } else {

  }
}


  
  // Bloquear carregamento infinito no Twitter
  function blockInfiniteLoading(profileName) {
    if (loadingBlocked && currentBlockedProfile === profileName) return;
  
    // Verificar se estamos no perfil alvo
    const currentProfile = window.location.pathname.split("/")[1];
    if (currentProfile !== profileName) {
      return; // Não bloquear se não estivermos no perfil alvo
    }
  
    loadingBlocked = true;
    currentBlockedProfile = profileName;

  
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

            buttonContainer.remove();
          }
        }
      });
    });
  
    loadingObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  

  }
  
  // Esqueleto para bloquear scroll no Instagram
  function blockScrollInstagram(profileName) {
    // Verificar se estamos no perfil alvo
    const currentProfile = getCurrentProfile().profile;
    if (currentProfile !== profileName) {
        return;
    }
    

    
    // Salvar a função fetch original se ainda não foi salva
    if (!window.originalFetch) {
        window.originalFetch = window.fetch;
    }
    
    // Interceptar fetch para bloquear completamente o carregamento de posts
    window.fetch = async function(...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
        
        // Bloquear requisições relacionadas a posts
        if (url && (
            url.includes('/graphql/query') || 
            url.includes('__a=1') || 
            url.includes('posts') || 
            url.includes('media')
        )) {

            
            // Retornar resposta vazia
            return new Response(JSON.stringify({
                data: null,
                status: 'blocked'
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        
        // Usar fetch original para outras requisições
        return window.originalFetch.apply(this, args);
    };
    
    // Adicionar estilos para bloquear completamente o conteúdo
    const style = document.createElement('style');
    style.id = 'botblocker-instagram-style';
    style.textContent = `
        /* Bloquear todos os elementos potenciais de post */
        article, 
        div[role="presentation"], 
        div[class*="x1yztbdb"], 
        div[class*="x1n2onr6"],
        img[class*="x1lliihq"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            max-height: 0 !important;
            overflow: hidden !important;
            pointer-events: none !important;
        }
        
        /* Desabilitar rolagem */
        body, html {
            overflow: hidden !important;
            max-height: 100vh !important;
        }
    `;
    document.head.appendChild(style);
    
    // Observador para remover continuamente qualquer conteúdo
    const observer = new MutationObserver(() => {
        const elementsToRemove = document.querySelectorAll(`
            article, 
            div[role="presentation"], 
            div[class*="x1yztbdb"], 
            div[class*="x1n2onr6"],
            img[class*="x1lliihq"]
        `);
        
        elementsToRemove.forEach(el => {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.height = '0';
            el.style.opacity = '0';
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
    });
    
    // Armazenar referência do observer para possível desconexão posterior
    window.instagramBlockObserver = observer;
}

function blockScrollFacebook(profileName) {
  if (loadingBlocked && currentBlockedProfile === profileName) return;

  const currentPath = window.location.pathname;
  if (!currentPath.includes(profileName)) return;

  loadingBlocked = true;
  currentBlockedProfile = profileName;


  // Backup da função original
  if (!originalFetch) {
    originalFetch = window.fetch;
  }

  window.fetch = async function (...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;

    if (url && url.includes('/api/graphql/') && window.location.pathname.includes(profileName)) {

      return new Response(JSON.stringify({ data: {} }));
    }

    return originalFetch.apply(this, args);
  };

  loadingObserver = new MutationObserver(() => {
    const currentPath = window.location.pathname;
    if (!currentPath.includes(profileName)) return;

    // Remover indicadores de carregamento ou "ver mais"
    document.querySelectorAll('[role="progressbar"], div[aria-label="Loading..."]').forEach(el => el.remove());
    document.querySelectorAll('div[role="button"]').forEach(button => {
      if (button.textContent.includes('See more') || button.textContent.includes('Ver mais')) {
        button.remove();
      }
    });
  });

  loadingObserver.observe(document.body, {
    childList: true,
    subtree: true
  });


}


// Função para desbloquear
function unblockScrollInstagram() {
    // Restaurar fetch original
    if (window.originalFetch) {
        window.fetch = window.originalFetch;
    }
    
    // Remover estilo de bloqueio
    const blockStyle = document.getElementById('botblocker-instagram-style');
    if (blockStyle) {
        blockStyle.remove();
    }
    
    // Desconectar observer
    if (window.instagramBlockObserver) {
        window.instagramBlockObserver.disconnect();
    }
}
  
  // Desbloquear carregamento
  function unblockLoading() {
    if (!loadingBlocked) return;
  

  
    // 1. Restaurar a função fetch original
    if (originalFetch) {
      window.fetch = originalFetch;

    }
  
    // 2. Desconectar o observador de loading
    if (loadingObserver) {
      loadingObserver.disconnect();

    }
  
    loadingBlocked = false;
    currentBlockedProfile = null;
  }
  
  // Adicionar indicador de bloqueio no perfil (Twitter)
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
  

  
    // Procurar pelo elemento que contém o nome do perfil
    const profileNameElement = document.querySelector('[data-testid="UserName"]');
  
    if (profileNameElement) {

  
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
  

        return true;
      }
  
      // Se não encontrar o header, tentar procurar o SpanWrapper
      const spanWrapper = profileNameElement.querySelector('span[dir="auto"]') ||
                         profileNameElement.querySelector('span');
  
      if (spanWrapper) {

  
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
  

        return true;
      }
  
      // Se nenhum dos métodos acima funcionar, tentar adicionar após os badges do nome
      const badges = profileNameElement.querySelector('[data-testid="UserBadges"]');
      if (badges) {

  
        // Adicionar o indicador após os badges
        badges.parentNode.insertBefore(blockedIndicator, badges.nextSibling);
  
        // Ajustar o display do contêiner pai para flex
        const badgesContainer = badges.parentElement;
        badgesContainer.style.display = 'flex';
        badgesContainer.style.alignItems = 'center';
        badgesContainer.style.flexWrap = 'nowrap';
  

        return true;
      }
  
      // Último recurso: adicionar diretamente após o nome do perfil
      profileNameElement.appendChild(blockedIndicator);
      profileNameElement.style.display = 'flex';
      profileNameElement.style.alignItems = 'center';
      profileNameElement.style.flexWrap = 'nowrap';
  

      return true;
    }
  
    // Método alternativo: procurar pelo cabeçalho do perfil
    const profileHeader = document.querySelector('[data-testid="UserName"], [data-testid="UserProfileHeader"]');
  
    if (profileHeader) {

  
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
  

      return true;
    }
  

    return false;
  }
  
  // Função para adicionar indicador no Instagram
  function addBlockedIndicatorInstagram(profileName) {
    // Verificar se estamos no perfil alvo
    const currentProfile = getCurrentProfile().profile;
    if (currentProfile !== profileName) {
        return false;
    }
    
    // Verificar se o indicador já existe
    if (document.getElementById('botblocker-indicator-instagram')) {
        return true;
    }
    

    
    // Criar o container principal centralizado
    const blockedIndicator = document.createElement('div');
    blockedIndicator.id = 'botblocker-indicator-instagram';
    
    // Estilos para centralização
    Object.assign(blockedIndicator.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#FF3A3A',
        color: 'white',
        padding: '20px 30px',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        zIndex: '9999',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '90%',
        width: '400px'
    });
    
    // Texto "BLOCKED"
    const blockedText = document.createElement('span');
    blockedText.textContent = 'BLOCKED';
    blockedText.style.fontWeight = 'bold';
    blockedText.style.fontSize = '24px';
    blockedText.style.marginBottom = '10px';
    
    // Referência ao perfil bloqueado
    const profileText = document.createElement('span');
    profileText.textContent = `Perfil: @${profileName}`;
    profileText.style.fontSize = '16px';
    profileText.style.opacity = '0.8';
    profileText.style.marginBottom = '15px';
    
    // Tag "BotBlocker"
    const botBlockerTag = document.createElement('span');
    botBlockerTag.textContent = 'BotBlocker';
    botBlockerTag.style.fontSize = '14px';
    botBlockerTag.style.opacity = '0.7';
    
    // Adicionar elementos ao indicador
    blockedIndicator.appendChild(blockedText);
    blockedIndicator.appendChild(profileText);
    blockedIndicator.appendChild(botBlockerTag);
    
    // Adicionar ao DOM
    document.body.appendChild(blockedIndicator);
    
    // Adicionar animação de fade in
    blockedIndicator.style.opacity = '0';
    blockedIndicator.style.transition = 'opacity 0.3s ease';
    
    // Trigger reflow para garantir a animação
    blockedIndicator.offsetHeight;
    
    // Fade in
    blockedIndicator.style.opacity = '1';
    
    return true;
}

function addBlockedIndicatorFacebook(profileName) {
  const currentPath = window.location.pathname;
  if (!currentPath.includes(profileName)) return;

  if (document.getElementById('botblocker-facebook-indicator')) return;



  const indicatorDiv = document.createElement('div');
  indicatorDiv.id = 'botblocker-facebook-indicator';
  indicatorDiv.textContent = 'BLOCKED';

  Object.assign(indicatorDiv.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#FF3A3A',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '30px',
    fontSize: '20px',
    fontWeight: 'bold',
    zIndex: '9999',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    pointerEvents: 'none',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    textAlign: 'center'
  });

  const tag = document.createElement('div');
  tag.textContent = 'BotBlocker';
  tag.style.fontSize = '12px';
  tag.style.opacity = '0.9';
  tag.style.marginTop = '4px';

  indicatorDiv.appendChild(tag);

  document.body.appendChild(indicatorDiv);


}


  
  // Aplicar blur a todos os tweets de um usuário
  function applyBlurToAllTweetsFromUser(username) {

  
    // Find all tweets in the timeline
    const articles = document.querySelectorAll('[role="article"]');
  
    articles.forEach(article => {
      const usernameLinks = article.querySelectorAll('a[href^="/"]');
  
      for (const link of usernameLinks) {
        const linkUsername = link.getAttribute('href').replace('/', '');
  
        if (linkUsername.toLowerCase() === username.toLowerCase()) {
          // Apply blur to this tweet
          chrome.storage.local.get(['remove_instead_of_blur'], (result) => {
            const shouldRemove = result.remove_instead_of_blur === true;
          
            if (shouldRemove) {
              article.remove();
            } else {
            article.style.filter = 'blur(5px)';
            article.style.transition = 'filter 0.3s ease';
            addBlockIndicatorToTweet(article);
            }
          })
          break; // Stop checking other links in this article
        }
      }
    });
  }

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
  
  // Função para aplicar blur a posts do Instagram
function applyBlurToAllPostsFromUserInstagram(username) {


  const posts = document.querySelectorAll('article');

  posts.forEach(post => {
    const profileLinks = post.querySelectorAll('a[href^="/"]');

    const isExactMatch = Array.from(profileLinks).some(link => {
      const href = link.getAttribute('href');
      return href === `/${username}` || href === `/${username}/`;
    });

    if (!isExactMatch) return;

    chrome.storage.local.get(['remove_instead_of_blur'], (result) => {
      const shouldRemove = result.remove_instead_of_blur === true;

      if (shouldRemove) {
        // Substitui conteúdo por um espaço mínimo discreto
        post.innerHTML = '';

        post.style.display = 'flex';
        post.style.alignItems = 'center';
        post.style.justifyContent = 'center';
        post.style.minHeight = '40px'; // altura reduzida
        post.style.backgroundColor = '#ffffff'; // branco
        post.style.border = '1px solid #ffffff'; // borda branca invisível
        post.style.color = '#ffffff'; // texto branco (invisível)
        post.style.fontSize = '14px';
        post.style.textAlign = 'center';

        const placeholder = document.createElement('div');
        placeholder.textContent = `Post ocultado`; // ainda presente, mas invisível
        post.appendChild(placeholder);
      } else {
        post.style.filter = 'blur(5px)';
        post.style.transition = 'filter 0.3s ease';

        if (!post.querySelector('.bot-blocker-instagram-indicator')) {
          const indicatorDiv = document.createElement('div');
          indicatorDiv.className = 'bot-blocker-instagram-indicator';
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
            zIndex: '999',
            fontSize: '14px',
            fontWeight: 'bold',
            pointerEvents: 'none'
          });

          const computedStyle = window.getComputedStyle(post);
          if (computedStyle.position === 'static') {
            post.style.position = 'relative';
          }

          post.appendChild(indicatorDiv);
        }
      }
    });
  });
}



  






  

  function blockStoryPreviewInFeed(username) {

  
    const storyButtons = Array.from(document.querySelectorAll('div[role="button"], button[role="button"]'));
    const cleanUsername = username.toLowerCase().replace(/^@/, '');
  
    storyButtons.forEach(button => {
      const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
  
      // Procurar correspondência exata de username
      const isExactMatch = new RegExp(`(^|\\s|@)${cleanUsername}([\\s,\\.!?]|$)`).test(ariaLabel);
  
      if (isExactMatch) {
        chrome.storage.local.get(['remove_instead_of_blur'], (result) => {
          const shouldRemove = result.remove_instead_of_blur === true;
  
          if (shouldRemove) {
            button.remove();
          } else {
            button.style.filter = 'blur(5px)';
            button.style.pointerEvents = 'none';
            button.style.transition = 'filter 0.3s ease';
          }
        });
      }
    });
  }

  function applyBlurToAllPostsFromUserFacebook(username) {
    const normalizedUsername = username.toLowerCase().replace(/\s+/g, '');


    const postsAndReels = document.querySelectorAll('div[role="article"], div[data-pagelet^="ReelFeed"]');

    postsAndReels.forEach(item => {
      const textContent = item.innerText?.toLowerCase().replace(/\s+/g, '');
      if (!textContent || !textContent.includes(normalizedUsername)) return;

      chrome.storage.local.get(['remove_instead_of_blur'], (result) => {
        const shouldRemove = result.remove_instead_of_blur === true;

        if (shouldRemove) {
          item.style.visibility = 'hidden';
          item.style.position = 'absolute';
          item.style.top = '-9999px';
          item.style.left = '-9999px';
          item.style.height = '0';
          item.style.width = '0';
        } else {
          item.style.filter = 'blur(5px)';
          item.style.transition = 'filter 0.3s ease';

          if (!item.querySelector('.bot-blocker-facebook-indicator')) {
            const indicatorDiv = document.createElement('div');
            indicatorDiv.className = 'bot-blocker-facebook-indicator';
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
              zIndex: '999',
              fontSize: '14px',
              fontWeight: 'bold',
              pointerEvents: 'none'
            });

            const computedStyle = window.getComputedStyle(item);
            if (computedStyle.position === 'static') {
              item.style.position = 'relative';
            }

            item.appendChild(indicatorDiv);
          }
        }
      });
    });
  }



function blockStoryPreviewInFeedFacebook(username) {


  const cleanUsername = username.toLowerCase().replace(/^@/, '').replace(/\s+/g, '');

  const storyLinks = document.querySelectorAll('a[role="link"][href*="/stories/"]');

  storyLinks.forEach(link => {
    const ariaLabel = (link.getAttribute('aria-label') || '').toLowerCase();
    const normalizedAria = ariaLabel.replace(/\s+/g, '');

    const isExactMatch = normalizedAria.includes(cleanUsername);

    if (isExactMatch) {
      chrome.storage.local.get(['remove_instead_of_blur'], (result) => {
        const shouldRemove = result.remove_instead_of_blur === true;

        if (shouldRemove) {
          link.remove();
        } else {
          link.style.filter = 'blur(5px)';
          link.style.pointerEvents = 'none';
          link.style.transition = 'filter 0.3s ease';

          // Adicionar indicador se ainda não existir
          if (!link.querySelector('.bot-blocker-facebook-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'bot-blocker-facebook-indicator';
            indicator.textContent = 'BLOCKED';

            Object.assign(indicator.style, {
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#FF3A3A',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              zIndex: '9999',
              pointerEvents: 'none'
            });

            const computedStyle = window.getComputedStyle(link);
            if (computedStyle.position === 'static') {
              link.style.position = 'relative';
            }

            // Forçar reflow antes de adicionar
            link.offsetHeight;
            link.appendChild(indicator);
          }
        }
      });
    }
  });
}




  
  
  
  
  
  
  
  
  
  // Remover blur dos tweets de um usuário
  function removeBlurFromUserTweets(username) {

  
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
  
  // Remover blur dos posts do Instagram
  function removeBlurFromPostsInstagram(username) {

    
    // Encontrar todos os posts
    const posts = document.querySelectorAll('article');
    
    posts.forEach(post => {
      const usernameElements = post.querySelectorAll('a[href^="/"]._aacl');
      
      for (const element of usernameElements) {
        const href = element.getAttribute('href');
        const match = href.match(/^\/([^\/]+)/);
        
        if (match && match[1] && match[1].toLowerCase() === username.toLowerCase()) {
          // Remover blur
          post.style.filter = 'none';
          
          // Remover indicador
          const indicator = post.querySelector('.bot-blocker-instagram-indicator');
          if (indicator) {
            indicator.remove();
          }
          break;
        }
      }
    });
  }
  
  // Verificar e processar bloqueio do perfil atual
  async function checkProfileAndProcessBlocking() {
  const { settings, blackList } = await getSettingsAndBlacklist();
  const tolerance = settings.tolerance || 50; 
  const badgeConfig = settings.badge || 'empty'; 
  const platform = detectCurrentPlatform();

  if (platform === 'unknown') return;

  const currentProfileInfo = getCurrentProfile();
  const currentProfile = currentProfileInfo.profile;


  console.log(`[BotBlocker] Current profile: ${currentProfile}`);

  if (currentProfile === 'home' || !currentProfile || currentProfile === '') {
    console.log(`[BotBlocker] Current profile is home or empty. Not applying block...`);
    return;
  }

  if (perfisDaAPI.length > 0) {
    const perfilAPI = perfisDaAPI.find(p => 
      p.username && p.username.toLowerCase() === currentProfile.toLowerCase()
    );

    const isManuallyBlocked = blackList.some(([username, blockedPlatform]) =>
      username.toLowerCase() === currentProfile.toLowerCase() && blockedPlatform.toLowerCase() === platform
    );

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

    if ((perfilAPI && perfilAPI.percentage > tolerance) || isManuallyBlocked || shouldBlockByBadge) {
      if (isManuallyBlocked) {
        console.log(`[BotBlocker] Perfil atual ${currentProfile} está manualmente bloqueado. Bloqueando...`);
      } else if (shouldBlockByBadge && perfilAPI) {
        console.log(`[BotBlocker] Perfil atual ${currentProfile} com badge '${perfilAPI.badge || 'empty'}' corresponde à configuração de bloqueio '${badgeConfig}'. Bloqueando...`);
      } else if (perfilAPI) {
        console.log(`[BotBlocker] Perfil atual ${currentProfile} encontrado na API com percentage ${perfilAPI.percentage}%. Bloqueando...`);
      }

      blockProfile(currentProfile, platform);

      if (platform === 'x') {
        let indicatorAdded = addBlockedIndicator(currentProfile);
        if (!indicatorAdded) {
          let attempts = 0;
          const indicatorInterval = setInterval(() => {
            if (attempts >= 5 || addBlockedIndicator(currentProfile)) {
              clearInterval(indicatorInterval);
              console.log(`[BotBlocker] Indicator added after ${attempts + 1} attempts`);
            }
            attempts++;
          }, 1000);
        }
      } else if (platform === 'instagram') {
        let indicatorAdded = addBlockedIndicatorInstagram(currentProfile);
        if (!indicatorAdded) {
          let attempts = 0;
          const indicatorInterval = setInterval(() => {
            if (attempts >= 5 || addBlockedIndicatorInstagram(currentProfile)) {
              clearInterval(indicatorInterval);
              console.log(`[BotBlocker] Instagram indicator added after ${attempts + 1} attempts`);
            }
            attempts++;
          }, 1000);
        }
      } else if (platform === 'facebook') {
        let indicatorAdded = addBlockedIndicatorFacebook(currentProfile);
        if (!indicatorAdded) {
          let attempts = 0;
          const indicatorInterval = setInterval(() => {
            if (attempts >= 5 || addBlockedIndicatorFacebook(currentProfile)) {
              clearInterval(indicatorInterval);
              console.log(`[BotBlocker] Facebook indicator added after ${attempts + 1} attempts`);
            }
            attempts++;
          }, 1000);
        }

        observePageChangeForFacebookUnblock(currentProfile);
      }

      perfisBlockeados.add(currentProfile);
    } else {
      // Desbloqueio automático se antes foi bloqueado mas agora não é necessário
      if (loadingBlocked && currentBlockedProfile === currentProfile && platform === 'x') {
        console.log(`[BotBlocker] Perfil ${currentProfile} não precisa ser bloqueado. Desbloqueando...`);
        unblockLoading();
        const indicator = document.getElementById('botblocker-indicator');
        if (indicator) indicator.remove();
      } else if (platform === 'facebook') {
        const indicator = document.getElementById('botblocker-facebook-indicator');
        if (indicator) {
          console.log(`[BotBlocker] Perfil ${currentProfile} não está mais bloqueado. Removendo indicador...`);
          indicator.remove();
        }

        if (typeof originalFetch === 'function') {
          window.fetch = originalFetch;
          console.log('[BotBlocker] Fetch restaurado no Facebook');
        }

        if (loadingObserver) {
          loadingObserver.disconnect();
        }
      }
    }
  } else {
    console.log('[BotBlocker] Aguardando carregamento de perfis da API...');
  }
}

  
  // Configuração dos observadores de DOM
  const mentionsObserver = new MutationObserver(() => {
    collectMentions();
  });
  
  const pageObserver = new MutationObserver(() => {
    const platform = detectCurrentPlatform();
    if (platform !== 'unknown') {
      checkProfileAndProcessBlocking();
      collectMentions();
    }
  });

    // Monitorar novos posts no Instagram feed e aplicar blur dinamicamente
if (detectCurrentPlatform() === 'instagram') {
  const feedObserver = new MutationObserver(() => {
    perfisBlockeados.forEach(username => {
      applyBlurToAllPostsFromUserInstagram(username);
      blockStoryPreviewInFeed(username); // Garante que os stories também fiquem bloqueados
    });
  });

  feedObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

if (detectCurrentPlatform() === 'facebook') {
  const fbObserver = new MutationObserver(() => {
    perfisBlockeados.forEach(username => {
      applyBlurToAllPostsFromUserFacebook(username);
      blockStoryPreviewInFeedFacebook(username); // Garante que os stories também fiquem bloqueados
    });
  });

  fbObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}
  
  // Inicialização dos scripts
  function initializeScripts() {
    // Detectar plataforma atual
    const platform = detectCurrentPlatform();
    console.log(`[BotBlocker] Initializing for platform: ${platform}`);
    
    if (platform === 'unknown') {
      console.log('[BotBlocker] Unsupported platform, not initializing BotBlocker');
      return;
    }
    
    // Carregar perfis da API
    fetchPerfis();
    
    // Inicializar coleta de menções
    collectMentions();
  
    // Esperar um pouco para que o DOM esteja mais carregado antes de verificar o perfil
    setTimeout(() => {
      checkProfileAndProcessBlocking();
      pageObserver.observe(document.body, { childList: true, subtree: true });
    }, 1000);
  }
  
  // Monitorar mudanças de URL (para SPAs)
  let previousUrl = window.location.href;
  const urlCheckInterval = setInterval(() => {
    if (window.location.href !== previousUrl) {
      console.log("[BotBlocker] URL changed from", previousUrl, "to", window.location.href);
  
      // Verificar se estávamos em um perfil bloqueado do Twitter e agora não estamos mais
      if (loadingBlocked && detectCurrentPlatform() === 'x') {
        const currentProfile = window.location.pathname.split("/")[1];
        if (currentProfile !== currentBlockedProfile) {
          console.log("[BotBlocker] Detected navigation away from blocked profile");
          unblockLoading();
  
          // Remover o indicador
          const indicator = document.getElementById('botblocker-indicator');
          if (indicator) {
            indicator.remove();
          }
        }
      }

      if (detectCurrentPlatform() === 'instagram') {
        const currentProfile = getCurrentProfile().profile;
        
        // Se não estiver mais no perfil bloqueado, desbloquear
        // tem um problema de estar sempre a dar load quando se volta para a homepage
        if (currentProfile === 'home' || currentProfile === '') {
          console.log("[BotBlocker] Detected navigation away from blocked Instagram profile");
          
          
          // Remover o indicador
          const indicator = document.getElementById('botblocker-indicator-instagram');
          if (indicator) {
            indicator.remove();
          }

          history.go(0);

      }
    
  
      // Atualizar a URL atual
      previousUrl = window.location.href;
      
      // Reconectar o observer
      pageObserver.disconnect();
      
      // Reinicializar considerando a nova URL
      initializeScripts();
    }
  }
  }
  , 1000);




  
  // Inicialização
  addStyles();
  initializeScripts();
  
  // Enviar mensagem indicando que o script está pronto
  chrome.runtime.sendMessage({
    action: "contentScriptReady",
    platform: detectCurrentPlatform(),
    url: window.location.href
  });
  
  console.log("[BotBlocker] Content script fully loaded");