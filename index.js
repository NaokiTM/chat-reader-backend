require("dotenv").config();

const express = require("express");
const cors = require("cors");



const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/upload", require("./routes/upload"));
app.use("/chat", require("./routes/chat"));

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(3000, () => console.log("Backend running on port 3000"));