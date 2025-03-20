const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=http://localhost:8000/api/v1/auth/google/callback/&prompt=consent&response_type=code&client_id=761894176093-5dn58g5tp54vt0gi1mmu3lpau7dr31p5.apps.googleusercontent.com&scope=openid%20email%20profile&access_type=offline`;


import React, { useState, useEffect } from "react";

const Login = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    let authWindow = window.open(GOOGLE_AUTH_URL, "popup", "width=500,height=600");
  };
  return (
    <div>
      <h1>BotBlocker</h1>
      <p>{isAuthenticated ? "Usuário autenticado." : "Nenhum cookie encontrado. Faça login."}</p>
      <button onClick={handleLogin}>
        Login com Google
      </button>
    </div>
  );
};

export default Login;
