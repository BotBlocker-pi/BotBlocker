// Ouvinte de mensagens enviadas pela extensão
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Verifica se a ação solicitada é "login"
  if (request.action === "login") {
    
    // URL de autenticação do Google OAuth 2.0
    const AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=http://localhost:8000/api/v1/auth/google/callback/&prompt=consent&response_type=code&client_id=761894176093-5dn58g5tp54vt0gi1mmu3lpau7dr31p5.apps.googleusercontent.com&scope=openid%20email%20profile&access_type=offline`;

    // Abre a janela de autenticação interativa do Chrome
    chrome.identity.launchWebAuthFlow(
      { url: AUTH_URL, interactive: true }, // "interactive: true" permite ao usuário interagir com o login
      (redirectUrl) => {
        // Verifica se houve erro ao iniciar a autenticação
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message });
          return;
        }

        // Extrai o código de autorização da URL de redirecionamento
        const urlParams = new URL(redirectUrl).searchParams;
        const authCode = urlParams.get("code");

        // Se o código de autorização foi obtido, continua para a troca pelo token de acesso
        if (authCode) {
          fetch("http://localhost:8000/api/v1/auth/google/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: authCode }), // Envia o código de autorização para o backend
          })
            .then((response) => response.json()) // Converte a resposta para JSON
            .then((data) => {
              if (data.access_token) {
                // Armazena o token de acesso no armazenamento local do Chrome
                chrome.storage.local.set({ accessToken: data.access_token }, () => {
                  console.log("✅ Token armazenado no chrome.storage.local:", data.access_token);
                  sendResponse({ success: true, token: data.access_token });
                });
              } else {
                sendResponse({ error: "Falha ao obter token" });
              }
            })
            .catch((error) => sendResponse({ error: error.message }));
        }
      }
    );

    return true; // Permite resposta assíncrona da API Chrome
  }
});
