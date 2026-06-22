const Database = require("better-sqlite3");
const db = new Database("books.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS chunks (
    id TEXT PRIMARY KEY,
    bookId TEXT,
    chapterIndex INTEGER,
    content TEXT,
    embedding TEXT
  )
`);

module.exports = db;