const API_BASE_URL = "http://localhost/api";

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

export const createProfile = async (url) => {
    try {
        const apiUrl = `${API_BASE_URL}/create_profile/?url=${encodeURIComponent(
            url
        )}`;
        console.log("Trying to create profile with:", apiUrl);

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            console.error(
                "Error creating profile:",
                response.status,
                response.statusText
            );
            return null;
        }
        const data = await response.json();
        console.log("Profile created:", date);
        return data;
    } catch (error) {
        console.error("Error creating profile:", error);
        return null;
    }
};

export const sendEvaluationToBackend = async (evaluationData) => {
    const token = localStorage.getItem("access_token");
    if (!token){alert("The user is not authenticated"); return null;}
    try {
        const response = await fetch(`${API_BASE_URL}/avaliacao/`, {
            method: "POST",
            headers: {"Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(evaluationData),
        });

        if (!response.ok) throw new Error("Failed to submit evaluation");

        return await response.json();
    } catch (error) {
        console.error("Error submitting evaluation:", error);
        return null;
    }
};

export const sendAvatarToBackend = async ({ url, avatar }) => {
    console.log("URL perfil:", url);
    console.log("URL avatar:", avatar);
  
    try {
      const response = await fetch(`${API_BASE_URL}/post_img/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, avatar }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Failed to update avatar");
      }
  
      const data = await response.json();
  
      return data;
    } catch (error) {
      return null;
    }
  };
  
  

export const getUserSettings = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        alert("The user is not authenticated");
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/get_settings/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            console.error(`Error getting settings: ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        console.log("User Settings:", data);
        return data;

    } catch (error) {
        console.error("Error fetching settings:", error);
        return null;
    }
};


export const sendUpdatedSettings = async (settingsData) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        console.log("User not authenticated");
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/update_settings/`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(settingsData)
        });

        if (!response.ok) throw new Error("Erro ao atualizar settings");

        const data = await response.json();
        console.log("Settings updated in backend:", data);
        return data;
    } catch (error) {
        console.error("Error sending settings to backend:", error);
        return null;
    }
};

export default {
    getProfileData,
    createProfile,
    sendEvaluationToBackend,
    getUserSettings,
    sendUpdatedSettings,
};