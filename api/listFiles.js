// // api/listFiles.js
// const express = require("express");
// const serverless = require("serverless-http");
// const cors = require("cors");
// const listFilesRouter = require("../routes/listFiles");

// const app = express();

// const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://waemandirikarya-wmk.web.app";

// app.use(cors({
//   origin: ALLOWED_ORIGIN,
//   methods: ["GET","OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));

// // mount router at root because Vercel will mount this file to /api/listFiles
// app.use("/", listFilesRouter);

// // health (optional)
// app.get("/_health", (req, res) => res.json({ ok: true }));

// module.exports = app;
// module.exports.handler = serverless(app);




// api/listFiles.js
const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const listFilesRouter = require("../routes/listFiles");

const app = express();

// baca env ALLOWED_ORIGINS (koma separated)
const raw = process.env.ALLOWED_ORIGINS || "";
const allowed = raw.split(",").map(s => s.trim()).filter(Boolean);

// dynamic origin function
const corsOptions = {
  origin: function(origin, callback) {
    // Jika no origin (curl, Postman), allow it
    if (!origin) return callback(null, true);

    if (allowed.length === 0) {
      // jika tidak ada whitelist, block by default (or allow all by setting "*")
      return callback(new Error("Origin not allowed by CORS"), false);
    }

    if (allowed.includes(origin)) {
      return callback(null, true);
    }

    // origin not in whitelist
    return callback(new Error("Origin not allowed by CORS"), false);
  },
  methods: ["GET", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  // credentials: true // aktifkan jika perlu
};

app.use((req, res, next) => {
  // gunakan cors middleware per-request untuk memastikan preflight ditangani
  cors(corsOptions)(req, res, (err) => {
    // jika origin tidak diijinkan, kirim 403 untuk preflight atau next untuk normal flow
    if (err) {
      console.warn("CORS reject:", req.headers.origin, err.message);
      res.status(403).send("CORS: Origin not allowed");
      return;
    }
    next();
  });
});

// mount router
app.use("/", listFilesRouter);

app.get("/_health", (req, res) => res.json({ ok: true }));

module.exports = app;
module.exports.handler = serverless(app);
