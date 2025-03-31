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

    if (request.action === 'blockProfile') {
        (async () => {
            try {
                const { username, platform } = request;
                const API_URL = 'http://localhost/api/toggle_block_profile/';

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        social: platform
                    }),
                    mode: 'cors'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('[BotBlocker Background] Profile blocked successfully:', data);
                sendResponse({ success: true, data });
            } catch (error) {
                console.error('[BotBlocker Background] Error blocking profile:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();

        return true; // Required to use sendResponse asynchronously
    }
});