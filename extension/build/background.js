// extension/src/background.js

chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(
            `Storage key "${key}" in namespace "${namespace}" changed.`,
            `Old value was "${oldValue}", new value is "${newValue}".`
        );
    }
});

// Function to inject content script
function injectContentScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab && (activeTab.url.includes("twitter.com") || activeTab.url.includes("x.com"))) {
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ["content.js"],
            });
        }
    });
}

// Inject script when extension is loaded
chrome.runtime.onInstalled.addListener(() => {
    injectContentScript();
});

// Inject script when tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        if (tab.url && (tab.url.includes("twitter.com") || tab.url.includes("x.com"))) {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["content.js"],
            });
        }
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchProfiles") {
        (async () => {
            try {
                console.log("[BotBlocker Background] Fetching profiles from API...");
                // Use the correct URL with /api/ prefix as we configured in nginx
                const response = await fetch("http://localhost/api/perfis/");

                // Check if response is OK before trying to parse JSON
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log("[BotBlocker Background] Profiles fetched successfully:", data);
                sendResponse({
                    success: true,
                    profiles: data.perfis || []
                });
            } catch (error) {
                console.error("[BotBlocker Background] Error fetching profiles:", error);
                sendResponse({
                    success: false,
                    error: error.message
                });
            }
        })();

        return true;
    }

    if (request.action === "getCurrentProfile") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, {action: "getCurrentProfile"}, function(response) {
                    sendResponse(response);
                });
            } else {
                sendResponse({error: "No active tab"});
            }
        });
        return true;
    }

    if (request.action === "blockProfile") {
        (async () => {
            try {
                const { username, platform = 'x' } = request;
                console.log(`[BotBlocker Background] Blocking profile ${username} on ${platform}...`);

                // Primeiro adiciona à lista negra local
                let cacheSuccess = false;
                try {
                    cacheSuccess = await addToBlacklist(username, platform);
                    console.log(`[BotBlocker Background] Cache update result: ${cacheSuccess ? 'Added to blacklist' : 'Already in blacklist'}`);
                } catch (cacheError) {
                    console.error("[BotBlocker Background] Error adding to local cache:", cacheError);
                    // Continuar mesmo com erro no cache
                }

                // Chamar a API para registrar o bloqueio
                let apiSuccess = false;
                try {
                    const response = await fetch("http://localhost/api/block_profile/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            username,
                            platform
                        })
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`[BotBlocker Background] API Error (${response.status}):`, errorText);
                    } else {
                        const data = await response.json();
                        console.log("[BotBlocker Background] Profile recorded in API:", data);
                        apiSuccess = true;
                    }
                } catch (apiError) {
                    console.error("[BotBlocker Background] API connection error:", apiError);
                }

                // Notificar o content script para aplicar o bloqueio
                try {
                    await sendMessageToTabs({
                        action: "blockProfileManually",
                        username,
                        platform
                    });
                } catch (notifyError) {
                    console.error("[BotBlocker Background] Error notifying tabs:", notifyError);
                }

                // Responder ao solicitante
                sendResponse({
                    success: cacheSuccess || apiSuccess,
                    message: `Profile ${username} ${cacheSuccess ? 'blocked locally' : 'not added to local cache'}. ${apiSuccess ? 'Recorded in API.' : 'Not recorded in API.'}`
                });
            } catch (error) {
                console.error("[BotBlocker Background] Error in block process:", error);
                sendResponse({
                    success: false,
                    error: error.message
                });
            }
        })();

        return true; // Manter canal aberto para resposta assíncrona
    }

    if (request.action === "unblockProfile") {
        (async () => {
            try {
                const { username, platform = 'x' } = request;
                console.log(`[BotBlocker Background] Unblock request for: ${username} (${platform})`);

                // First remove from local cache blacklist
                await removeFromBlacklist(username, platform);

                // Then call the API to record the unblock
                const response = await fetch("http://localhost/api/unblock_profile/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username,
                        platform
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log("[BotBlocker Background] Profile unblocked on API:", data);

                // Notificar o content script para aplicar o desbloqueio
                try {
                    await sendMessageToTabs({
                        action: "unblockProfileManually",
                        username,
                        platform
                    });
                } catch (notifyError) {
                    console.error("[BotBlocker Background] Error notifying tabs:", notifyError);
                }

                sendResponse({
                    success: true,
                    message: `Profile ${username} unblocked successfully`
                });
            } catch (error) {
                console.error("[BotBlocker Background] Error unblocking profile:", error);
                sendResponse({
                    success: false,
                    error: error.message
                });
            }
        })();

        return true; // Keep channel open for async response
    }

});

function addToBlacklist(username, platform = 'x') {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['blackList'], function(result) {
            const blackList = result.blackList || [];

            // Verificar se já existe
            const exists = blackList.some(entry => {
                if (Array.isArray(entry)) {
                    return entry[0].toLowerCase() === username.toLowerCase() && entry[1] === platform;
                }
                return false;
            });

            if (!exists) {
                blackList.push([username, platform]);
                chrome.storage.local.set({ blackList }, function() {
                    if (chrome.runtime.lastError) {
                        console.error('[BotBlocker] Error saving to storage:', chrome.runtime.lastError);
                        reject(chrome.runtime.lastError);
                    } else {
                        console.log(`[BotBlocker] Added ${username} (${platform}) to blacklist`);
                        resolve(true);
                    }
                });
            } else {
                console.log(`[BotBlocker] ${username} (${platform}) already in blacklist`);
                resolve(false);
            }
        });
    });
}

function removeFromBlacklist(username, platform = 'x') {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['blackList'], function(result) {
            const blackList = result.blackList || [];

            // Filtrar a lista para remover o item correspondente
            const updatedList = blackList.filter(entry => {
                if (Array.isArray(entry)) {
                    return !(entry[0].toLowerCase() === username.toLowerCase() && entry[1] === platform);
                }
                return true;
            });

            // Salvar a lista atualizada
            chrome.storage.local.set({ blackList: updatedList }, function() {
                if (chrome.runtime.lastError) {
                    console.error('[BotBlocker] Error saving to storage:', chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                } else {
                    console.log(`[BotBlocker] Removed ${username} (${platform}) from blacklist`);
                    resolve(true);
                }
            });
        });
    });
}

// Função para enviar mensagem para tabs com segurança
function sendMessageToTabs(message) {
    return new Promise((resolve) => {
        chrome.tabs.query({url: ["*://*.twitter.com/*", "*://*.x.com/*"]}, function(tabs) {
            if (!tabs || tabs.length === 0) {
                console.log("[BotBlocker] No Twitter/X tabs found to notify");
                resolve(false);
                return;
            }

            console.log(`[BotBlocker] Found ${tabs.length} tabs to notify`);

            // Array para acompanhar as respostas das tabs
            const responses = [];
            let waitingFor = tabs.length;

            tabs.forEach(tab => {
                try {
                    chrome.tabs.sendMessage(tab.id, message, function(response) {
                        // Capturar erros de comunicação
                        if (chrome.runtime.lastError) {
                            console.log(`[BotBlocker] Error sending message to tab ${tab.id}:`, chrome.runtime.lastError.message);
                        } else if (response) {
                            responses.push(response);
                        }

                        // Decrementar contador
                        waitingFor--;
                        if (waitingFor <= 0) {
                            resolve(responses);
                        }
                    });
                } catch (e) {
                    console.error(`[BotBlocker] Exception sending message to tab ${tab.id}:`, e);
                    waitingFor--;
                    if (waitingFor <= 0) {
                        resolve(responses);
                    }
                }
            });

            // Timeout para não esperar indefinidamente
            setTimeout(() => {
                if (waitingFor > 0) {
                    console.log(`[BotBlocker] Timeout waiting for ${waitingFor} tabs to respond`);
                    resolve(responses);
                }
            }, 1000);
        });
    });
}