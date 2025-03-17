
export const getProfileData = async (url) => {
    try {
        const response = await fetch(`http://localhost:8000/get_probability/?url=${encodeURIComponent(url)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error("Error getting profile data:", error);
        return null;
    }
};
export default getProfileData;
