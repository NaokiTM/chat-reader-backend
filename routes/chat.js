const express = require("express");
const router = express.Router();
const db = require("../db");
const { embed, cosineSimilarity } = require("../embeddings");

router.post("/", async (req, res) => {
  try {
    const { bookId, question, currentChapter } = req.body;

    // will do semantic search + LLM call once API key is in
    res.json({ answer: "API key not set yet" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;