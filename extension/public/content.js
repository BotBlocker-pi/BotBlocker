console.log("[Auto Remove Articles] Content script loaded and running");

const profileName = "elonmusk"; // Nome do perfil desejado

// Função para remover elementos com role="article"
function removeArticles() {
    const articles = document.querySelectorAll('[role="article"]');
    if (articles.length > 0) {
        console.log(`[Auto Remove Articles] Found ${articles.length} articles to remove`);
        articles.forEach(article => {
            console.log("[Auto Remove Articles] Removing article element");
            article.remove();
        });
    } else {
        console.log("[Auto Remove Articles] No articles found");
    }
}

// Função para verificar se estamos no perfil correto e executar a remoção de artigos
function checkProfileAndRemoveArticles() {
    const currentProfile = window.location.pathname.split("/")[1]; // Extrai o nome do perfil da URL
    if (currentProfile === profileName) {
        console.log(`[Auto Remove Articles] Running on profile: ${profileName}`);
        removeArticles();
    } else {
        console.log(`[Auto Remove Articles] Not running on profile: ${currentProfile}`);
    }
}

// Observa mudanças no DOM que indicam uma mudança de rota
const observer = new MutationObserver((mutationsList) => {
    console.log("[Auto Remove Articles] DOM changed, checking for route change");
    checkProfileAndRemoveArticles();
});

// Executa a verificação inicial
checkProfileAndRemoveArticles();

// Inicia a observação do DOM
observer.observe(document.body, { childList: true, subtree: true });

// Observa mudanças na URL (útil para SPAs como Twitter/X)
let previousUrl = window.location.href;
setInterval(() => {
    if (window.location.href !== previousUrl) {
        console.log("[Auto Remove Articles] URL changed, checking for route change");
        previousUrl = window.location.href;
        checkProfileAndRemoveArticles();
    }
}, 1000); // Verifica a URL a cada 1 segundo