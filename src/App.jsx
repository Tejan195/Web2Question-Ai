import React, { useState } from 'react';
import { generateQuestionsFromAPI } from './helpers/geminiApi';

function App() {
  const [questions, setQuestions] = useState(null);

  const handleGenerateFromPage = () => {
    chrome.runtime.sendMessage({ action: 'extractTextFromPage' }, async (response) => {
      if (response.pageText) {
        try {
          const questions = await generateQuestionsFromAPI(response.pageText);
          setQuestions(questions);
        } catch (error) {
          console.error('Error generating questions:', error);
        }
      }
    });
  };

  return (
    <div className="App">
      <h1>Web2Question AI</h1>
      <button onClick={handleGenerateFromPage}>Generate Questions from Website</button>
      
      {questions && (
        <div id="output">
          <div className="question-paper">
            <h2>Question Paper</h2>
            <section>
              <h3>Short Questions</h3>
              <ul className="short-questions">
                {questions.short.map((q, index) => (
                  <li key={index}>{q}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3>Long Questions</h3>
              <ul className="long-questions">
                {questions.long.map((q, index) => (
                  <li key={index}>{q}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
