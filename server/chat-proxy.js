const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
require("dotenv").config();

async function askOpenAI(prompt) {
  if (!process.env.OPENAI_KEY) return "Chatbot not enabled (no OpenAI key).";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.OPENAI_KEY
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful booking assistant." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300
    })
  });

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "No response.";
}

module.exports = { askOpenAI };
