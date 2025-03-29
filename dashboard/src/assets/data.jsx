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

export default {
getEvaluationHistory,
};
