chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "login") {
    const AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?
redirect_uri=http://localhost:8000/api/v1/auth/google/callback/&
prompt=consent&
response_type=code&
client_id=761894176093-5dn58g5tp54vt0gi1mmu3lpau7dr31p5.apps.googleusercontent.com&
scope=openid%20email%20profile&
access_type=offline`;

    chrome.identity.launchWebAuthFlow(
      { url: AUTH_URL, interactive: true },
      (redirectUrl) => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message });
          return;
        }

        const urlParams = new URL(redirectUrl).searchParams;
        const authCode = urlParams.get("code");

        if (authCode) {
          fetch("http://localhost:8000/api/v1/auth/google/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: authCode }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.access_token) {
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

    return true; // Permite resposta assíncrona
  }
});
