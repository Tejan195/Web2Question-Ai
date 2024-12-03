export const generateQuestionsFromAPI = async (text) => {
  try {
    const { API_KEY } = await new Promise((resolve) =>
      chrome.storage.local.get("API_KEY", (result) => resolve(result))
    );

    if (!API_KEY) {
      throw new Error("API key is missing.");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate a comprehensive question paper with both short and long questions based on this text:

${text}

Format the response strictly like this:
SHORT QUESTIONS:
1. [Short Question 1]
2. [Short Question 2]
...

LONG QUESTIONS:
1. [Long Question 1]
2. [Long Question 2]
...`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) throw new Error("Failed to generate questions");
    const data = await response.json();
    const questionsText = data.candidates[0].content.parts[0].text;

    const shortQuestionsMatch = questionsText.match(/SHORT QUESTIONS:([\s\S]*?)LONG QUESTIONS:/);
    const longQuestionsMatch = questionsText.match(/LONG QUESTIONS:([\s\S]*)/);

    const short = shortQuestionsMatch
      ? shortQuestionsMatch[1].trim().split("\n").map((q) => q.replace(/^\d+\.\s*/, "").trim())
      : [];

    const long = longQuestionsMatch
      ? longQuestionsMatch[1].trim().split("\n").map((q) => q.replace(/^\d+\.\s*/, "").trim())
      : [];

    return { short, long };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { short: [], long: [] };
  }
};
