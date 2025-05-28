import { API_URL} from "../api/config.js";

// Função para autenticar utilizadores (Login)
export const loginUser = async (username, password) => {
    try {
        const response = await fetch(`${API_URL}/token/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json(); 

        if (!response.ok) {
            if (response.status === 403 && data.timeout_ends_at) {
                const endDate = new Date(data.timeout_ends_at);
                const localDate = endDate.toLocaleString();
                throw new Error(`⏱️ Your account is under timeout until ${localDate}`);
            }
            throw new Error(data.error || "Login failed.");
        }

        return data;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;  
    }
};


// Função para registar um novo utilizador
export const registerUser = async (username, email, password) => {
    try {
        const response = await fetch(`${API_URL}/create_user/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username, email: email, password })
        });
        const reposta=await response.json();
        return reposta;
    } catch (error) {
        console.error('Registration error:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// Função para verificar se o utilizador está autenticado
export const checkAuth = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) return false;
    console.log(1);

    try {
        console.log(1);
        const response = await fetch(`${API_URL}/protected/`, {
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
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
};



// Exporta todas as funções
export default {
    loginUser,
    registerUser,
    checkAuth,
    logoutUser
};
