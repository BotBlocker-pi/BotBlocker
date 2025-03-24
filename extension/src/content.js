console.log("[Collect Mentions] Content script loaded and running");

// Variável para armazenar os perfis da API
let perfisDaAPI = [];

// Função simples para buscar perfis da API
async function fetchPerfis() {
    try {
        const response = await fetch('http://localhost:8000/perfis/'); // Substitua pela sua URL
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        const data = await response.json();
        perfisDaAPI = data.perfis;
        console.log('[API] Perfis recebidos:', perfisDaAPI);
    } catch (error) {
        console.error('[API] Erro ao buscar perfis:', error);
    }
}


fetchPerfis();


// const collectedMentions = new Set();

// function collectMentions() {
//     const usernameElements = document.querySelectorAll('[data-testid="User-Name"]');

//     if (usernameElements.length > 0) {
//         console.log(`[Collect Mentions] Found ${usernameElements.length} usernames`);

//         usernameElements.forEach(element => {
//             const usernameLink = element.querySelector('a[href^="/"]');
//             if (usernameLink) {
//                 const mention = usernameLink.getAttribute("href").slice(1);
//                 collectedMentions.add(`@${mention}`);
//             }
//         });

//         console.log("[Collect Mentions] Collected mentions so far:");
//         collectedMentions.forEach(mention => console.log(mention));
//     } else {
//         console.log("[Collect Mentions] No usernames found");
//     }
// }

// const mentionsObserver = new MutationObserver((mutationsList) => {
//     console.log("[Collect Mentions] DOM changed, checking for new content");
//     collectMentions();
// });

// console.log("[Auto Remove Articles] Content script loaded and running");

// const profileName = "elonmusk";

// function removeArticles() {
//     const articles = document.querySelectorAll('[role="article"]');
//     if (articles.length > 0) {
//         console.log(`[Auto Remove Articles] Found ${articles.length} articles to remove`);
//         articles.forEach(article => {
//             console.log("[Auto Remove Articles] Removing article element");
//             article.remove();
//         });
//     } else {
//         console.log("[Auto Remove Articles] No articles found");
//     }
// }

// function checkProfileAndRemoveArticles() {
//     const currentProfile = window.location.pathname.split("/")[1];
//     if (currentProfile === profileName) {
//         console.log(`[Auto Remove Articles] Running on profile: ${profileName}`);
//         removeArticles();
//     } else {
//         console.log(`[Auto Remove Articles] Not running on profile: ${currentProfile}`);
//     }
// }

// const articlesObserver = new MutationObserver((mutationsList) => {
//     console.log("[Auto Remove Articles] DOM changed, checking for route change");
//     checkProfileAndRemoveArticles();
// });

// function initializeScripts() {
//     collectMentions();
//     mentionsObserver.observe(document.body, { childList: true, subtree: true });
//     checkProfileAndRemoveArticles();
//     articlesObserver.observe(document.body, { childList: true, subtree: true });
// }

// let previousUrl = window.location.href;
// const urlCheckInterval = setInterval(() => {
//     if (window.location.href !== previousUrl) {
//         console.log("[Both Scripts] URL changed, reinitializing");
//         previousUrl = window.location.href;
//         mentionsObserver.disconnect();
//         articlesObserver.disconnect();
//         initializeScripts();
//     }
// }, 1000);

// initializeScripts();