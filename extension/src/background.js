// extension/src/background.js

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

// Injeta o script quando o usuário navega para o Twitter
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && (tab.url.includes("twitter.com") || tab.url.includes("x.com"))) {
        injectContentScript();
    }
});