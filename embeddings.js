const Groq = require("groq-sdk");
const { pipeline } = require("@xenova/transformers");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

let embedder = null;

async function getEmbedder() {
  if (!embedder) {
    console.log("Loading embedding model (first time only)...");
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedder;
}

async function embed(text) {
  const embedder = await getEmbedder();
  const result = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(result.data);
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

async function chat(systemPrompt, userMessage) {
  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });
  return res.choices[0].message.content;
}

module.exports = { embed, cosineSimilarity, chat };