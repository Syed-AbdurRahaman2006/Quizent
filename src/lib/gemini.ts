const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function askGemini(prompt: string) {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ]
                })
            }
        );

        if (!response.ok) {
            console.error("Gemini API Error:", response.statusText);
            throw new Error("API request failed");
        }

        const data = await response.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No insights available.";
    } catch (err) {
        console.error("Failed to fetch insights", err);
        return "AI insights currently unavailable.";
    }
}
