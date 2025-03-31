const API_BASE_URL = "http://localhost:8000";

export const getProfileData = async (url) => {
    try {
        console.log("URL received for analysis:", url);

        // First, extract the profile name from the URL
        let profileName = null;
        if (url.includes('twitter.com/') || url.includes('x.com/')) {
            const urlParts = url.split('/');
            // The profile name is after the domain, typically the 4th element in the array
            for (let i = 0; i < urlParts.length; i++) {
                if (urlParts[i].includes('twitter.com') || urlParts[i].includes('x.com')) {
                    profileName = urlParts[i+1];
                    break;
                }
            }

            // Remove query parameters if any
            if (profileName && profileName.includes('?')) {
                profileName = profileName.split('?')[0];
            }
        }

        console.log("Extracted profile name:", profileName);

        if (!profileName) {
            console.log("No profile name found in URL");
            return null;
        }

        // Make request to API with the profile name
        const apiUrl = `${API_BASE_URL}/get_probability/?username=${encodeURIComponent(profileName)}`;
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

        // If the API call fails, try to get data from content script via background
        try {
            return new Promise((resolve) => {
                chrome.runtime.sendMessage({action: "getCurrentProfile"}, (response) => {
                    if (response && response.profile) {
                        // Create simplified data structure from content script response
                        const mockData = {
                            perfil_name: response.profile,
                            plataform: "Twitter",
                            probability: response.apiData ? response.apiData.percentage : 50,
                            numberOfEvaluations: Math.floor(Math.random() * 100) + 10,
                            badge: response.apiData && response.apiData.percentage > 50 ? "warning" : "verified"
                        };
                        resolve(mockData);
                    } else {
                        resolve(null);
                    }
                });
            });
        } catch (contentError) {
            console.error("Error getting data from content script:", contentError);
            return null;
        }
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
    sendEvaluationToBackend,
    getUserSettings,
    sendUpdatedSettings,
};