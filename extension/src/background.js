// Adicione "facebook.com" aos domínios suportados
const SUPPORTED_DOMAINS = ["twitter.com", "x.com", "instagram.com", "facebook.com"];

const API_URL = "http://mednat.ieeta.pt:8776/api"; // URL da API

// Helper para checar se a URL corresponde a uma rede suportada
function isSupportedUrl(url) {
    return SUPPORTED_DOMAINS.some(domain => url.includes(domain));
}

// ---------------------------------------
// INJETAR SCRIPT
// ---------------------------------------
function injectContentScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab && isSupportedUrl(activeTab.url)) {
            console.log("[BotBlocker Background] Injecting content script into:", activeTab.url);
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ["content.js"],
            });
        }
    });
}

chrome.runtime.onInstalled.addListener(() => {
    injectContentScript();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url && isSupportedUrl(tab.url)) {
        chrome.scripting.executeScript({
            target: { tabId },
            files: ["content.js"],
        });
    }
});

// ---------------------------------------
// LISTENER DE MENSAGENS
// ---------------------------------------
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchProfiles") {
        (async () => {
            try {
                const response = await fetch(`${API_URL}/perfis/`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                sendResponse({ success: true, profiles: data.perfis || [] });
            } catch (error) {
                console.error("[BotBlocker] Fetch error:", error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    if (request.action === "getCurrentProfile") {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "getCurrentProfile" }, function (response) {
                    sendResponse(response);
                });
            } else {
                sendResponse({ error: "No active tab" });
            }
        });
        return true;
    }

    if (request.action === "blockProfile") {
        (async () => {
            const { username, platform = 'x' } = request;
            let cacheSuccess = false;
            let apiSuccess = false;

            try {
                cacheSuccess = await addToBlacklist(username, platform);
            } catch (cacheError) {
                console.error("Error updating local blacklist:", cacheError);
            }

            try {
                const response = await fetch(`${API_URL}/block_profile/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, platform }),
                });

                if (response.ok) {
                    const data = await response.json();
                    apiSuccess = true;
                } else {
                    console.error("API error:", await response.text());
                }
            } catch (err) {
                console.error("API connection error:", err);
            }

            try {
                await sendMessageToTabs({
                    action: "blockProfileManually",
                    username,
                    platform
                });
            } catch (err) {
                console.error("Notify tabs error:", err);
            }

            sendResponse({
                success: cacheSuccess || apiSuccess,
                message: `Profile ${username} ${cacheSuccess ? 'blocked locally' : ''} ${apiSuccess ? 'and sent to API.' : ''}`
            });
        })();
        return true;
    }

    if (request.action === "unblockProfile") {
        (async () => {
            const { username, platform = 'x' } = request;

            try {
                await removeFromBlacklist(username, platform);

                const response = await fetch(`${API_URL}/unblock_profile/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, platform }),
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();

                await sendMessageToTabs({
                    action: "unblockProfileManually",
                    username,
                    platform
                });

                sendResponse({ success: true, message: `Profile ${username} unblocked successfully.` });
            } catch (error) {
                console.error("Unblock error:", error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }
});

// ---------------------------------------
// UTILITÁRIOS
// ---------------------------------------
function addToBlacklist(username, platform = 'x') {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['blackList'], function (result) {
            const blackList = result.blackList || [];

            const exists = blackList.some(entry =>
                Array.isArray(entry) &&
                entry[0].toLowerCase() === username.toLowerCase() &&
                entry[1] === platform
            );

            if (!exists) {
                blackList.push([username, platform]);
                chrome.storage.local.set({ blackList }, () => {
                    if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                    else resolve(true);
                });
            } else {
                resolve(false);
            }
        });
    });
}

function removeFromBlacklist(username, platform = 'x') {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['blackList'], function (result) {
            const blackList = result.blackList || [];

            const updated = blackList.filter(entry =>
                !(Array.isArray(entry) && entry[0].toLowerCase() === username.toLowerCase() && entry[1] === platform)
            );

            chrome.storage.local.set({ blackList: updated }, () => {
                if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                else resolve(true);
            });
        });
    });
}

function sendMessageToTabs(message) {
    return new Promise((resolve) => {
        chrome.tabs.query({
            url: [
                "*://*.twitter.com/*",
                "*://*.x.com/*",
                "*://*.instagram.com/*",
                "*://*.facebook.com/*" // <--- incluído Facebook
            ]
        }, function (tabs) {
            if (!tabs || tabs.length === 0) return resolve(false);

            let responses = [];
            let remaining = tabs.length;

            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, message, function (response) {
                    if (!chrome.runtime.lastError && response) {
                        responses.push(response);
                    }
                    remaining--;
                    if (remaining === 0) resolve(responses);
                });
            });

            setTimeout(() => {
                if (remaining > 0) resolve(responses);
            }, 1000);
        });
    });
}
