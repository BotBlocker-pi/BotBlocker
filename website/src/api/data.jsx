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
                // Add any necessary authentication headers
            },
            body: JSON.stringify({
                user_id: userId,  // Use the passed userId directly
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

export default {
    getEvaluationHistory,
    getProfileData,
    assignBadgeToProfile
};