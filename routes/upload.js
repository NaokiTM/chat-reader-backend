const express = require("express");
const router = express.Router();
const db = require("../db");
const { chunkText } = require("../chunker");
const { embed } = require("../embeddings");
const crypto = require("crypto");

router.post("/", express.json({ limit: "50mb" }), async (req, res) => {
  try {
    const { bookId, chapters } = req.body;
    // chapters = [{ index: 0, text: "..." }, ...]

    for (const chapter of chapters) {
      const chunks = chunkText(chapter.text);
      for (const chunk of chunks) {
        const id = crypto.randomUUID();
        // embedding will go here once we have the API key
        db.prepare(`
          INSERT INTO chunks (id, bookId, chapterIndex, content, embedding)
          VALUES (?, ?, ?, ?, ?)
        `).run(id, bookId, chapter.index, chunk, null);
      }
    }

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;