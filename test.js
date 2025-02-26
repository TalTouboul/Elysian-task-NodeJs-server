const express = require('express');
const { OpenAI } = require("openai");
const dotenv = require('dotenv');


// Initialize the express app
const app = express();
app.use(express.json());

// Configuration for the OpenAI API
dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Calls OpenAI's chat API with a user input and returns the response message.
 * @param {string} userInput - The text input to send to the model.
 * @returns {Promise<string>} - The model's response.
 */
async function getOpenAiResponse(userInput) {
  try {
    // Call the chat completions endpoint with a system and user message.
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Change to your desired model, e.g., "gpt-3.5-turbo"
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userInput },
      ],
    });
    
    // Return the content of the first message in the choices array.
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching OpenAI response:", error);
    throw error;
  }
}

// Example usage:
(async () => {
  const inputText = "Tell me a joke about technology.";
  try {
    const response = await getOpenAiResponse(inputText);
    console.log("OpenAI response:", response);
  } catch (err) {
    console.error("Failed to get response from OpenAI:", err);
  }
})();

module.exports = { getOpenAiResponse };
