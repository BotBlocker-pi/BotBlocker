const API_BASE_URL = "http://localhost:8000"; 

export const getProfileData = async (url) => {
    try {
        const response = await fetch(`${API_BASE_URL}/get_probability/?url=${encodeURIComponent(url)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

        return await response.json();
    } catch (error) {
        console.error("Error getting profile data:", error);
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

export default {
    getProfileData,
    sendEvaluationToBackend,
};
