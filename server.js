// index.js (or server.js)
require('dotenv').config();
const express = require('express');
const { OpenAI } = require("openai");
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://tal:tubul1497@elysian0softech0task.nxnzmn3.mongodb.net/';
const mongoClient = new MongoClient(mongoUri);
let db;

// Function to get the OpenAI key from MongoDB
async function getOpenAiKey() {
  // Use a separate client instance or reuse the same connection carefully
  const clientForKey = new MongoClient(mongoUri);
  try {
    await clientForKey.connect();
    const dbForKey = clientForKey.db("elysian_db");
    const openaiCollection = dbForKey.collection("OpenAI");
    const doc = await openaiCollection.findOne({});
    if (doc && doc.OPENAI_KEY) {
      return doc.OPENAI_KEY;
    } else {
      throw new Error("OpenAI key not found in the database");
    }
  } finally {
    await clientForKey.close();
  }
}

// Main async function to initialize everything
async function init() {
  try {
    // Retrieve the OpenAI key from the DB
    const openAiKey = await getOpenAiKey();
    // Initialize the OpenAI client
    const openai = new OpenAI({ apiKey: openAiKey });
    
    // Connect to MongoDB for other operations
    await mongoClient.connect();
    db = mongoClient.db("elysian_db");

    // Define your route
    app.post('/gpt/get-chatgpt-response', async (req, res) => {
      try {
        const usersCollection = db.collection('users');
        const userData = await usersCollection.findOne({ email: req.body.email });
  
        if (!userData) {
          return res.status(404).json({ message: "User not found" });
        }
        const _userInput = `Say "Hello ${userData.name} ${userData.familyName}" and give him a warm welcome! with a smile :)`;  
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "developer", content: "You are a nice host." },
            {
              role: "user",
              content: _userInput,
              max_tokens: 50,
            },
          ],
        });
  
        res.json({ message: completion.choices[0].message });
      } catch (error) {
        console.error("Error calling OpenAI:", error);
        res.status(500).json({ error: "Failed to fetch response from OpenAI" });
      }
    });
  
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Initialization error:", err);
    process.exit(1);
  }
}

// Start the initialization
init();


//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
