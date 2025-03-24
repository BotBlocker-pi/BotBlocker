const API_BASE_URL = "http://localhost:8000"; // Define a URL base da API


// Função para autenticar utilizadores (Login)
export const loginUser = async (username, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/token/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username, password })
        });

        if (!response.ok) throw new Error("Credenciais inválidas");

        return await response.json(); // Retorna os tokens (access e refresh)
    } catch (error) {
        console.error("Error logging in:", error);
        return null;
    }
};

// Função para registar um novo utilizador
export const registerUser = async (username, email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/register/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        return await response.json();
    } catch (error) {
        console.error("Error registering user:", error);
        return null;
    }
};

// Função para verificar se o utilizador está autenticado
export const checkAuth = async () => {
    const token = localStorage.getItem("access_token");
    
    if (!token) return false;
    console.log(1);

    try {
        console.log(1);
        const response = await fetch(`${API_BASE_URL}/api/protected/`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
        });
        console.log(1);

        return response.ok;
    } catch (error) {
        console.log(11);
        console.error("Error checking authentication:", error);
        return false;
    }
};

// Função para fazer logout (removendo o token)
export const logoutUser = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
};



// Exporta todas as funções
export default {
    loginUser,
    registerUser,
    checkAuth,
    logoutUser
};
