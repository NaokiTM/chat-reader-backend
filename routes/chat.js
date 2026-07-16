const express = require("express");
const router = express.Router();
const db = require("../db");
const { embed, cosineSimilarity, chat } = require("../embeddings");

router.post("/", async (req, res) => {
  try {
    const { bookId, question, currentChapter } = req.body;

    // embed the question
    const qEmbedding = await embed(question);

    // get all chunks for this book
    const chunks = db.prepare("SELECT * FROM chunks WHERE bookId = ?").all(bookId);

    // score each chunk
    const scored = chunks.map((chunk) => ({
      ...chunk,
      score: cosineSimilarity(qEmbedding, JSON.parse(chunk.embedding)),
    }));

    // sort and take top 5
    const top = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const context = top.map((c) => c.content).join("\n\n---\n\n");

    const systemPrompt = `You are a reading companion for a book.
      Rules:
      - Only use the provided context to answer
      - Do not use outside knowledge
      - If the answer isn't in the context, say so
      - Keep answers concise
      - Do not spoil chapters beyond chapter ${currentChapter}

      Context:
      ${context}
    `;

    const answer = await chat(systemPrompt, question);
    res.json({ answer, sources: top.map((c) => ({ chapterIndex: c.chapterIndex, preview: c.content.slice(0, 100) })) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;