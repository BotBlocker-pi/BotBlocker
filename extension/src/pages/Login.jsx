import React from "react";
import { useEffect } from "react";

const Login = () => {
  // URL para autenticação com Google OAuth2
  const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=http://localhost:8000/api/v1/auth/google/callback/&prompt=consent&response_type=code&client_id=761894176093-5dn58g5tp54vt0gi1mmu3lpau7dr31p5.apps.googleusercontent.com&scope=openid%20email%20profile&access_type=offline`;

  // Função para iniciar o login via Google OAuth
  const handleLogin = () => {
    // Envia uma mensagem para o serviço em segundo plano (background script) da extensão do Chrome
    chrome.runtime.sendMessage({ action: "login" }, (response) => {
      if (response && response.token) {
        // ✅ Armazena o token de acesso no storage local do Chrome
        chrome.storage.local.set({ accessToken: response.token }, () => {
          console.log("✅ Token armazenado na extensão:", response.token);

          // 🔄 Recarrega a página para atualizar o estado autenticado
          window.location.reload();
        });
      } else {
        console.log("❌ Erro ao autenticar:", response?.error);

        // 🚨 Armazena manualmente um token fixo (provavelmente para debug/testes)
        const str1="ya29.a0AeXRPp4KZK8p6TY1WwXnJj8Pm3TBrJQN4Hl9hV3IjFF9S9xGJwCC1RAnI6nz-_hzEj-E4Mm1Q4A7e9q8TojqbyuE8MtNPkGSCo2bnJ8gnHGBgOEvcGTOybC1igyXQY2E6BppkngI9mGldlN_VwAnZscNkyEzNCgZX3fMr6IyaCgYKAUcSARESFQHGX2MiSTJysJqNMIGSmMoXQxasIA0175"
        chrome.storage.local.set(
          {
            accessToken:str1
          },
          () => {
            console.log(
              "✅ Token armazenado na extensão:", str1);

            // 🔄 Recarrega a página para tentar novamente
            window.location.reload();
          }
        );
      }
    });
  };

  return (
    <div>
      <h1>BotBlocker</h1>
      {/* Botão para iniciar o processo de login */}
      <button onClick={handleLogin}>Login com Google</button>
    </div>
  );
};

export default Login;
