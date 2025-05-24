const API_BASE_URL = "http://localhost/api";

export const getEvaluationHistory = async (url) => {
    try {
        const apiUrl = `${API_BASE_URL}/get_evaluation_history/?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            console.error(`Failed to fetch evaluation history: ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        console.log("Evaluation History:", data);
        return data;
    } catch (error) {
        console.error("Error fetching evaluation history:", error);
        return null;
    }
};

export const getProfileData = async (url) => {
    try {
        console.log("URL received for analysis:", url);
        const apiUrl = `${API_BASE_URL}/get_probability/?url=${encodeURIComponent(url)}`;
        console.log("Making request to:", apiUrl);

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            console.error(`API Error: ${response.status} - ${response.statusText}`);
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Data returned from API:", data);
        return data;
    } catch (error) {
        console.error("Error getting profile data:", error);
        return null;
    }
};

export const assignBadgeToProfile = async (userId, badge) => {
    try {
        const apiUrl = `${API_BASE_URL}/give_badge/`;
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify({
                user_id: userId,
                badge: badge
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to assign badge');
        }

        const data = await response.json();
        console.log("Badge assignment response:", data);
        return {
            success: true,
            message: data.message || `Profile verified as ${badge}`,
            updatedProfile: data.profile
        };
    } catch (error) {
        console.error("Error assigning badge:", error);
        return {
            success: false,
            error: error.message || 'Error connecting to server'
        };
    }
};

export const getSuspiciousActivities = async () => {
    try {
        const apiUrl = `${API_BASE_URL}/suspicious-activities/`;
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch suspicious activities: ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        console.log("Suspicious Activities:", data);
        return data;
    } catch (error) {
        console.error("Error fetching suspicious activities:", error);
        return null;
    }
};

export const markActivityResolved = async (activityId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/suspicious-activities/${activityId}/resolve/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to mark activity as resolved: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Resolved:", data);
        return data;
    } catch (err) {
        console.error("Error resolving activity:", err);
        return null;
    }
};

export const banUser = async (userId, reason = "No reason provided") => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/ban/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify({ user_id: userId, reason })
        });

        if (!response.ok) throw new Error(`Ban failed: ${response.statusText}`);

        const data = await response.json();
        console.log("User banned:", data);
        return data;
    } catch (error) {
        console.error("Error banning user:", error);
        return null;
    }
};

export const unbanUser = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/unban/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify({ user_id: userId })
        });

        if (!response.ok) throw new Error(`Unban failed: ${response.statusText}`);

        const data = await response.json();
        console.log("User unbanned:", data);
        return data;
    } catch (error) {
        console.error("Error unbanning user:", error);
        return null;
    }
};

export const applyTimeout = async (userId, durationSeconds) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/timeout/apply/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify({ user_id: userId, duration: durationSeconds })
        });

        if (!response.ok) throw new Error(`Apply timeout failed: ${response.statusText}`);

        const data = await response.json();
        console.log("Timeout applied:", data);
        return data;
    } catch (error) {
        console.error("Error applying timeout:", error);
        return null;
    }
};

export const revokeTimeout = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/timeout/revoke/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify({ user_id: userId })
        });

        if (!response.ok) throw new Error(`Revoke timeout failed: ${response.statusText}`);

        const data = await response.json();
        console.log("Timeout revoked:", data);
        return data;
    } catch (error) {
        console.error("Error revoking timeout:", error);
        return null;
    }
};

export const getUsersDetailed = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/get_users_detailed/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem("access_token")}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na resposta: ${response.status}`);
        }

        const data = await response.json();
        return data.users || [];
    } catch (error) {
        console.error('Erro ao buscar utilizadores:', error);
        return [];
    }
};

export const getUserTimeouts = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/timeouts/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem("access_token")}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na resposta: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao buscar timeouts:", error);
        return null;
    }
};

export const getUserEvaluations = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/evaluations/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem("access_token")}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na resposta: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao buscar avaliações:", error);
        return [];
    }
};

const getUserRole = () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return 'user';
    const decoded = jwtDecode(token);
    return decoded.role || 'user';
  } catch (error) {
    console.error("Erro ao obter role do token:", error);
    return 'user';
  }
};




export default {
    getEvaluationHistory,
    getProfileData,
    assignBadgeToProfile,
    getSuspiciousActivities,
    markActivityResolved,
    banUser,
    unbanUser,
    applyTimeout,
    revokeTimeout,
    getUsersDetailed,
    getUserTimeouts,
    getUserEvaluations
};