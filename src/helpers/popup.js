import { generateQuestionsFromAPI } from "./geminiApi.js";
document.getElementById("generateFromPage").addEventListener("click", async () => {
  console.log("Generate button clicked");
  chrome.runtime.sendMessage({ action: "extractTextFromPage" }, async (response) => {
    if (response && response.pageText) {
      try {
        const questions = await generateQuestionsFromAPI(response.pageText);
        if (questions && Array.isArray(questions.short) && Array.isArray(questions.long)) {
          displayQuestions(questions);
        } else {
          console.error("Invalid questions format:", questions);
          displayError("Unexpected response format. Please try again later.");
        }
      } catch (error) {
        console.error("Error generating questions:", error);
        displayError("Failed to generate questions. Please try again.");
      }
    } else {
      console.error("No page text extracted or response undefined");
      displayError("No text found on the page. Make sure the page has readable content.");
    }
  });
});

const displayQuestions = (questions) => {
  const output = document.getElementById("output");
  output.innerHTML = ""
  const escapeHTML = (str) => str.replace(/[&<>"']/g, (match) => 
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[match]));
  output.innerHTML = `
    <div class="question-paper">
      <h2>Question Paper</h2>
      <section>
        <h3>Short Questions</h3>
        <ul class="short-questions">
          ${questions.short.map((q) => `<li>${escapeHTML(q)}</li>`).join("")}
        </ul>
      </section>
      <section>
        <h3>Long Questions</h3>
        <ul class="long-questions">
          ${questions.long.map((q) => `<li>${escapeHTML(q)}</li>`).join("")}
        </ul>
      </section>
    </div>
  `;
};
const displayError = (message) => {
  const output = document.getElementById("output");
  output.innerHTML = `<div class="error">${message}</div>`;
};
