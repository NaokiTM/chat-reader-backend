const express = require("express");
const router = express.Router();
const db = require("../db");
const { chunkText } = require("../chunker");
const { embed } = require("../embeddings");
const crypto = require("crypto");

router.post("/", async (req, res) => {
  try {
    const { bookId, chapters } = req.body;
    console.log("Upload received, bookId:", bookId, "chapters:", chapters?.length);

    db.prepare("DELETE FROM chunks WHERE bookId = ?").run(bookId);

    let total = 0; 
    for (const chapter of chapters) {
      console.log("Processing chapter", chapter.index);
      const chunks = chunkText(chapter.text);
      console.log("Chunks:", chunks.length);
      for (const chunk of chunks) {
        const id = crypto.randomUUID();
        const embedding = await embed(chunk);
        db.prepare(`
          INSERT INTO chunks (id, bookId, chapterIndex, content, embedding)
          VALUES (?, ?, ?, ?, ?)
        `).run(id, bookId, chapter.index, chunk, JSON.stringify(embedding));
        total++;
      }
    }

    res.json({ ok: true, chunks: total });
  } catch (e) {
    console.error("Upload error:", e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router