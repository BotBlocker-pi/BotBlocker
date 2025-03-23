console.log("[Collect Mentions] Content script loaded and running");

const collectedMentions = new Set();

function collectMentions() {
    const usernameElements = document.querySelectorAll('[data-testid="User-Name"]');

    if (usernameElements.length > 0) {
        console.log(`[Collect Mentions] Found ${usernameElements.length} usernames`);

        usernameElements.forEach(element => {
            const usernameLink = element.querySelector('a[href^="/"]');
            if (usernameLink) {
                const mention = usernameLink.getAttribute("href").slice(1);
                collectedMentions.add(`@${mention}`);
            }
        });

        console.log("[Collect Mentions] Collected mentions so far:");
        collectedMentions.forEach(mention => console.log(mention));
    } else {
        console.log("[Collect Mentions] No usernames found");
    }
}

// Observa mudanças no DOM que indicam novos conteúdos carregados
const observer = new MutationObserver((mutationsList) => {
    console.log("[Collect Mentions] DOM changed, checking for new content");
    collectMentions();
});

collectMentions();

observer.observe(document.body, { childList: true, subtree: true });

let previousUrl = window.location.href;
setInterval(() => {
    if (window.location.href !== previousUrl) {
        console.log("[Collect Mentions] URL changed, checking for new content");
        previousUrl = window.location.href;
        collectMentions();
    }
}, 1000); // 1 segundo