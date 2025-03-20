import { useState, useEffect } from "react";
import { loginUser, checkAuth, logoutUser } from "../api/loginApi";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  

  useEffect(() => {
    const checkAuthentication = async () => {
        const authenticated = await checkAuth();
        setIsAuthenticated(authenticated);
    };

    checkAuthentication();
}, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    const data = await loginUser(username, password);
    if (data) {
      localStorage.setItem("access_token", data.access);
      setMessage("✅ Login bem-sucedido!");
      setIsAuthenticated(true);
    } else {
      setMessage("❌ Credenciais inválidas.");
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    logoutUser();
    setIsAuthenticated(false);
    console.log(2222);

  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>✅ User autenticado</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <>
          <h2>Login</h2>
          {message && <p>{message}</p>}
          <form onSubmit={handleLogin}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Entrar</button>
          </form>
        </>
      )}
    </div>
  );
};

export default Login;
