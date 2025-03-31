// extension/src/background.js
chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      console.log(
        `Storage key "${key}" in namespace "${namespace}" changed.`,
        `Old value was "${oldValue}", new value is "${newValue}".`
      );
    }
  });
// Função para injetar o script de conteúdo na página do Twitter
function injectContentScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab.url.includes("twitter.com") || activeTab.url.includes("x.com")) {
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ["content.js"],
            });
        }
    });
}

// Injeta o script quando a extensão é carregada
chrome.runtime.onInstalled.addListener(() => {
    injectContentScript();
});

// Modificar a função existente em background.js
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        injectContentScript();
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchProfiles") {
        const API_URL = 'http://localhost:8000/perfis/';

        console.log('[BotBlocker Background] Fetching profiles from API:', API_URL);

        fetch(API_URL, {
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('[BotBlocker Background] Profiles fetched successfully:', data);
                sendResponse({success: true, profiles: data.perfis || []});
            })
            .catch(error => {
                console.error('[BotBlocker Background] Error fetching profiles:', error);
                sendResponse({success: false, error: error.message});
            });

        return true; // Required to use sendResponse asynchronously
    }

    // Add handler for getCurrentProfile
    if (request.action === "getCurrentProfile") {
        // Forward this to the content script of the active tab
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
});