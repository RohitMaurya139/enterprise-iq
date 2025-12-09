import Groq from "groq-sdk";
import dotenv from "dotenv";
import { vectorStore } from "./prepare.js";
import NodeCache from "node-cache";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generate(userMessage, threadId) {
  try {
      const question = userMessage;
      

      // TTL = 1 hour (3600 seconds) — change as needed.
     const memory = new NodeCache({ stdTTL: 3600, checkperiod: 120 });


    // 1. Load conversation memory using threadId
    let history = memory.get(threadId) || [];

    // 2. ---------------------------------------
    // RAG: Retrieve similar chunks from vector DB
    // ---------------------------------------
    const relevantChunks = await vectorStore.similaritySearch(question, 3);

    const context = relevantChunks
      .map((chunk) => chunk.pageContent)
      .join("\n\n");

    const SYSTEM_PROMPT = `
      You are an enterprise assistant.
      Use ONLY the given context to answer the question.
      If context does not contain answer → say: "I don't know."
      Maintain natural, helpful tone.
    `;

    // 3. Construct message array
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },

      // Attach conversation history
      ...history,

      {
        role: "user",
        content: `
        Question: ${question}
        
        Relevant Context:
        ${context}

        Answer:
        `,
      },
    ];

    // 4. LLM Response
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
    });

    const answer =
      completion?.choices?.[0]?.message?.content || "No response received";

    // 5. Save memory back to NodeCache
    const updatedHistory = [
      ...history,
      { role: "user", content: question },
      { role: "assistant", content: answer },
    ];

    memory.set(threadId, updatedHistory);

    // 6. Return the final answer
    return answer;
  } catch (err) {
    console.error("Memory Chat Error:", err);
    return "Something went wrong.";
  }
}
