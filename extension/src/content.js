// content.js - Adaptado para suportar múltiplas redes sociais
console.log("[BotBlocker] Content script loaded and running");

// Detectar imagem de perfil
const waitForImage = setInterval(() => {
  const image = document.querySelector('img[alt="Opens profile photo"]');
  if (image) {
    console.log("Image found:", image.src);

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
  } else if (url.includes('threads.net')) {
    return 'threads';
  }
  
  return 'unknown';
}

// Variáveis globais
let perfisDaAPI = [];
let perfisBlockeados = new Set();
let currentPlatform = detectCurrentPlatform();

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
            console.log("[BotBlocker] Avatar Instagram convertido para DataURL.");
            return dataUrl;
            } else {
            console.warn("[BotBlocker] Falha ao converter imagem Instagram.");
            }
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
    // Facebook: extração diferente do perfil
    // Exemplo simplificado: facebook.com/username ou facebook.com/profile.php?id=12345
    const path = window.location.pathname.substring(1);
    const profileMatch = path.match(/^([^\/]+)/);
    const currentProfile = profileMatch ? profileMatch[1] : '';
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
    console.log(`[BotBlocker] Manual block request for profile: ${request.username} on ${request.platform}`);

    // Add to the set of blocked profiles
    perfisBlockeados.add(request.username);

    // Block the profile on the specific platform
    blockProfile(request.username, request.platform);

    sendResponse({ success: true });
  }

  if (request.action === "unblockProfileManually") {
    console.log(`[BotBlocker] Manual unblock request for profile: ${request.username} on ${request.platform}`);

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
        
        // Verificar se deve aplicar blur ao tweet
        applyBlurToTweet(element, mention);
      }
    });
  } else if (platform === 'instagram') {
    // Implementação Instagram (exemplo)
    // Adaptar para os seletores específicos do Instagram
    const usernameElements = document.querySelectorAll('a[href^="/"]._aacl');
    
    usernameElements.forEach(element => {
      // Extrair o nome de usuário da href
      const href = element.getAttribute('href');
      const match = href.match(/^\/([^\/]+)/);
      if (match && match[1]) {
        const mention = match[1];
        if (!collectedMentions.has(mention)) {
          newProfilesFound.push(mention);
        }
        collectedMentions.add(mention);
      }
    });
  }
  
  // Log dos novos perfis encontrados
  if (newProfilesFound.length > 0) {
    console.log(`%c[BotBlocker] Novos perfis encontrados no DOM (${newProfilesFound.length}):`, 'background: #27AE60; color: white; padding: 2px 5px; border-radius: 3px;');
    newProfilesFound.forEach(perfil => {
      console.log(`%c- @${perfil}`, 'color: #27AE60;');
    });
  }

  // Log de todos os perfis coletados até agora
  if (collectedMentions.size > 0) {
    console.log(`%c[BotBlocker] Total de perfis no DOM (${collectedMentions.size}):`, 'background: #16A085; color: white; padding: 2px 5px; border-radius: 3px;');
    const perfisList = Array.from(collectedMentions);
    perfisList.sort();
    perfisList.forEach(perfil => {
      console.log(`%c- @${perfil}`, 'color: #16A085;');
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
      postContainer.style.filter = 'blur(5px)';
      postContainer.style.transition = 'filter 0.3s ease';
      addBlockIndicatorToTweet(postContainer);
      return;
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
    console.log('[BotBlocker] No profiles from API to compare. Waiting for loading...');
    return;
  }

  console.log('[BotBlocker] Checking profiles for blocking...');
  console.log('%c[BotBlocker] Comparison of DOM vs. API profiles:', 'background: #8E44AD; color: white; padding: 2px 5px; border-radius: 3px;');
  console.log('Badge configuration:', badgeConfig);

  const profilesBlockedAutomatically = [];
  const profilesBlockedManually = [];
  const profilesBlockedByBadge = [];
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

    const isBlacklisted = blackList.some(([user, blockedPlatform]) =>
      user.toLowerCase() === profileName.toLowerCase() && blockedPlatform === platform
    );
    
    if (isBlacklisted) {
      console.log(`[BotBlocker] Perfil ${profileName} está na blacklist. A bloquear...`);
      blockProfile(profileName, platform);
      perfisBlockeados.add(profileName);
      return;
    }

    const isManuallyBlocked = manuallyBlockedSet.has(`${profileName.toLowerCase()}|${platform}`);
    if (isManuallyBlocked) {
      console.log(`[BotBlocker] Profile ${profileName} is manually blocked. Blocking...`);
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
      console.log(`[BotBlocker] Profile ${profileName} has badge '${apiProfile.badge}' which matches blocking config '${badgeConfig}'. Blocking...`);
      blockProfile(profileName, platform);
      perfisBlockeados.add(profileName);
      return;
    }

    if (apiProfile.percentage > tolerance) {
      console.log(`[BotBlocker] Profile ${profileName} found in API with percentage ${apiProfile.percentage}%. Automatically blocking...`);
      blockProfile(profileName, platform);
      perfisBlockeados.add(profileName);
    }
  });
}

// Função principal para bloquear um perfil em qualquer plataforma
function blockProfile(profileName, platform) {
    platform = platform || detectCurrentPlatform();
    
    console.log(`[BotBlocker] Blocking profile ${profileName} on ${platform}...`);
    
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
        removePostsInstagram(profileName);
        blockScrollInstagram(profileName);
        addBlockedIndicatorInstagram(profileName);
      } else {
        // Estamos no feed - aplicar blur aos posts
        applyBlurToAllPostsFromUserInstagram(profileName);
      }
    }
  }
  
  // Função para desbloquear um perfil
  function unblockProfile(username, platform) {
    platform = platform || detectCurrentPlatform();
    
    console.log(`[BotBlocker] Unblocking profile ${username} on ${platform}...`);
    
    if (platform === 'x') {
      // Verificar se estamos visualizando este perfil
      const currentProfile = window.location.pathname.split("/")[1];
      if (currentProfile.toLowerCase() === username.toLowerCase()) {
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
      removeBlurFromUserTweets(username);
    } else if (platform === 'instagram') {
      // Implementação para Instagram
      const currentProfile = getCurrentProfile().profile;
      if (currentProfile.toLowerCase() === username.toLowerCase()) {
        console.log(`[BotBlocker] Currently viewing Instagram profile. Applying unblocking...`);
        
        // Remover estilos e limitações
        const styleElement = document.getElementById('botblocker-instagram-style');
        if (styleElement) {
          styleElement.remove();
        }
        
        // Remover o indicador de bloqueio
        const indicator = document.getElementById('botblocker-indicator-instagram');
        if (indicator) {
          indicator.remove();
        }
        
        // Recarregar página
        window.location.reload();
      }
      
      // Remover blur dos posts do usuário
      removeBlurFromPostsInstagram(username);
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
      console.log(`[BotBlocker] Found ${articles.length} articles to remove for ${profileName}`);
      articles.forEach(article => {
        article.remove();
      });
    }
  }
  
  // Esqueleto para remover posts do Instagram
  function removePostsInstagram(profileName) {
    // Verificar se estamos no perfil alvo
    const currentProfile = getCurrentProfile().profile;
    if (currentProfile !== profileName) {
      return;
    }
    
    // No Instagram, os posts são artigos
    const posts = document.querySelectorAll('article');
    if (posts.length > 0) {
      console.log(`[BotBlocker] Found ${posts.length} posts to remove for ${profileName} on Instagram`);
      posts.forEach(post => {
        post.remove();
      });
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
    console.log(`[BotBlocker] Starting to block infinite loading for ${profileName}`);
  
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
        console.log(`[BotBlocker] Intercepted tweet load request for ${profileName}`);
  
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
          console.log(`[BotBlocker] Removing loading indicator for ${profileName}`);
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
            console.log(`[BotBlocker] Removing "Show more" button for ${profileName}`);
            buttonContainer.remove();
          }
        }
      });
    });
  
    loadingObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  
    console.log(`[BotBlocker] Tweet loading blocked successfully for ${profileName}`);
  }
  
  // Esqueleto para bloquear scroll no Instagram
  function blockScrollInstagram(profileName) {
    // Verificar se estamos no perfil alvo
    const currentProfile = getCurrentProfile().profile;
    if (currentProfile !== profileName) {
      return;
    }
    
    console.log(`[BotBlocker] Starting to block scroll loading for ${profileName} on Instagram`);
    
    // Adicionar estilos que bloqueiam o conteúdo
    const style = document.createElement('style');
    style.id = 'botblocker-instagram-style';
    style.textContent = `
      article { display: none !important; }
      ._aak3, ._aabd { overflow: hidden !important; height: 200px !important; }
    `;
    document.head.appendChild(style);
  }
  
  // Desbloquear carregamento
  function unblockLoading() {
    if (!loadingBlocked) return;
  
    console.log(`[BotBlocker] Unblocking infinite loading for ${currentBlockedProfile}`);
  
    // 1. Restaurar a função fetch original
    if (originalFetch) {
      window.fetch = originalFetch;
      console.log('[BotBlocker] Restored original fetch function');
    }
  
    // 2. Desconectar o observador de loading
    if (loadingObserver) {
      loadingObserver.disconnect();
      console.log('[BotBlocker] Disconnected loading observer');
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
    
    console.log(`[BotBlocker] Attempting to add blocked indicator for ${profileName} on Instagram`);
    
    // No Instagram, o cabeçalho do perfil tem outra estrutura
    const profileHeader = document.querySelector('header');
    if (!profileHeader) return false;
    
    // Criar o card indicador
    const blockedIndicator = document.createElement('div');
    blockedIndicator.id = 'botblocker-indicator-instagram';
    blockedIndicator.style.backgroundColor = '#FF3A3A';
    blockedIndicator.style.color = 'white';
    blockedIndicator.style.padding = '4px 10px';
    blockedIndicator.style.borderRadius = '4px';
    blockedIndicator.style.display = 'flex';
    blockedIndicator.style.flexDirection = 'column';
    blockedIndicator.style.alignItems = 'center';
    blockedIndicator.style.justifyContent = 'center';
    blockedIndicator.style.position = 'absolute';
    blockedIndicator.style.top = '20px';
    blockedIndicator.style.right = '20px';
    blockedIndicator.style.zIndex = '9999';
  
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
    
    // Adicionar ao DOM
    document.body.appendChild(blockedIndicator);
    
    return true;
  }
  
  // Aplicar blur a todos os tweets de um usuário
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
  
  // Função para aplicar blur a posts do Instagram
  function applyBlurToAllPostsFromUserInstagram(username) {
    console.log(`[BotBlocker] Applying blur to all posts from ${username} on Instagram`);
    
    // Encontrar todos os posts na timeline do Instagram
    const posts = document.querySelectorAll('article');
    
    posts.forEach(post => {
      const usernameElements = post.querySelectorAll('a[href^="/"]._aacl');
      
      for (const element of usernameElements) {
        const href = element.getAttribute('href');
        const match = href.match(/^\/([^\/]+)/);
        
        if (match && match[1] && match[1].toLowerCase() === username.toLowerCase()) {
          // Apply blur to this post
          post.style.filter = 'blur(5px)';
          post.style.transition = 'filter 0.3s ease';
          
          // Adicionar indicador de bloqueio
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
          
          // Adicionar estilo ao container
          Object.assign(post.style, {
            position: 'relative'
          });
          
          post.appendChild(indicatorDiv);
          break;
        }
      }
    });
  }
  
  // Remover blur dos tweets de um usuário
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
  
  // Remover blur dos posts do Instagram
  function removeBlurFromPostsInstagram(username) {
    console.log(`[BotBlocker] Removing blur from posts by ${username} on Instagram`);
    
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
  
    // Se for homepage ou perfil vazio, não aplicar bloqueio
    if (currentProfile === 'home' || !currentProfile || currentProfile === '') {
      console.log(`[BotBlocker] Current profile is home or empty. Not applying block...`);
      return;
    }
  
    // Verificar se o perfil atual está na lista de perfis para bloquear
    if (perfisDaAPI.length > 0) {
      const perfilAPI = perfisDaAPI.find(p => 
        p.username && p.username.toLowerCase() === currentProfile.toLowerCase()
      );
      
      const isManuallyBlocked = blackList.some(([username, blockedPlatform]) =>
        username.toLowerCase() === currentProfile.toLowerCase() && blockedPlatform.toLowerCase() === platform
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
  
      if ((perfilAPI && perfilAPI.percentage > tolerance) || isManuallyBlocked || shouldBlockByBadge) {
        // Log diferente dependendo do tipo de bloqueio
        if (isManuallyBlocked) {
          console.log(`[BotBlocker] Perfil atual ${currentProfile} está manualmente bloqueado. Bloqueando...`);
        } else if (shouldBlockByBadge && perfilAPI) {
          console.log(`[BotBlocker] Perfil atual ${currentProfile} com badge '${perfilAPI.badge || 'empty'}' corresponde à configuração de bloqueio '${badgeConfig}'. Bloqueando...`);
        } else if (perfilAPI) {
          console.log(`[BotBlocker] Perfil atual ${currentProfile} encontrado na API com percentage ${perfilAPI.percentage}%. Bloqueando...`);
        }
  
        // Aplicar bloqueio conforme a plataforma
        blockProfile(currentProfile, platform);
  
        // Tentar adicionar o indicador se necessário (depende da plataforma)
        if (platform === 'x') {
          let indicatorAdded = addBlockedIndicator(currentProfile);
          if (!indicatorAdded) {
            // Se não conseguir adicionar imediatamente, tentar algumas vezes
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
            // Se não conseguir adicionar imediatamente, tentar algumas vezes
            let attempts = 0;
            const indicatorInterval = setInterval(() => {
              if (attempts >= 5 || addBlockedIndicatorInstagram(currentProfile)) {
                clearInterval(indicatorInterval);
                console.log(`[BotBlocker] Instagram indicator added after ${attempts + 1} attempts`);
              }
              attempts++;
            }, 1000);
          }
        }
  
        // Adicionar ao conjunto de perfis bloqueados
        perfisBlockeados.add(currentProfile);
      } else if (loadingBlocked && currentBlockedProfile === currentProfile && platform === 'x') {
        // Se estamos em um perfil do Twitter que não precisa ser bloqueado mas está sendo bloqueado
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
  
      // Atualizar a URL atual
      previousUrl = window.location.href;
      
      // Reconectar o observer
      pageObserver.disconnect();
      
      // Reinicializar considerando a nova URL
      initializeScripts();
    }
  }, 1000);
  
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