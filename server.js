// server.js (drop-in replacement)
require("dotenv").config({ path: ".env.local" });

const express = require("express");
const cors = require("cors");
const path = require("path");

const listFilesRouter = require("./routes/listFiles");
const sendEmailRouter = require("./routes/sendEmail");

const app = express();

// ---------- CORS ----------
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4000",
  "https://waemandirikarya-wmk.web.app",
  "https://wmk.co.id",
  "https://www.wmk.co.id"
];

// For quick debugging you can set ALLOW_ALL_CORS=true in env to allow '*'
const allowAll = String(process.env.ALLOW_ALL_CORS || "").toLowerCase() === "true";

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // curl/postman/no origin
    if (allowAll) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // not allowed: respond with no CORS header (browser will block)
    return callback(null, false);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));            // global CORS middleware
app.options("*", cors(corsOptions));   // ensure preflight uses same CORS headers

// ---------- Body parser ----------
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------- Simple request logger (dev) ----------
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - origin: ${req.headers.origin || "-"}`);
  next();
});

// ---------- Mount routes ----------
app.use("/listFiles", listFilesRouter);

// Explicitly add an OPTIONS handler for /sendEmail to be extra-safe
app.options("/sendEmail", cors(corsOptions), (req, res) => res.sendStatus(200));

// Mount the sendEmail router (ensure this file exists and exports router)
app.use("/sendEmail", sendEmailRouter);

// rename storage route (kept as you had it)
const { Storage } = require("@google-cloud/storage");
function makeStorage() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64) {
    const credsJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, "base64").toString("utf8");
    const credentials = JSON.parse(credsJson);
    return new Storage({ projectId: credentials.project_id, credentials });
  }
  return new Storage();
}

async function renameInBucket(bucketName, oldPath, newPath) {
  const storage = makeStorage();
  const bucket = storage.bucket(bucketName);
  const srcFile = bucket.file(oldPath);
  const destFile = bucket.file(newPath);
  const [exists] = await srcFile.exists();
  if (!exists) {
    const e = new Error("Source file tidak ditemukan di bucket");
    e.code = 404;
    throw e;
  }
  await srcFile.copy(destFile);
  await srcFile.delete();
  const downloadUrl = `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(newPath)}`;
  return { downloadUrl, path: newPath };
}

app.post("/api/renameStorage", async (req, res) => {
  try {
    const { oldPath, newPath } = req.body;
    if (!oldPath || !newPath) return res.status(400).json({ error: "oldPath dan newPath wajib dikirim" });
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || process.env.GCLOUD_STORAGE_BUCKET;
    if (!bucketName) return res.status(500).json({ error: "Missing bucket env var (FIREBASE_STORAGE_BUCKET)" });
    const result = await renameInBucket(bucketName, oldPath, newPath);
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error("renameStorage error:", err);
    const status = err.code === 404 ? 404 : 500;
    return res.status(status).json({ error: err.message || String(err) });
  }
});

// health
app.get("/_health", (req, res) => res.json({ ok: true }));

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err && err.stack ? err.stack : err);
  // If CORS callback returned false, cors middleware does not throw; browser blocks.
  if (err && err.message && err.message.includes("Not allowed by CORS")) {
    return res.status(403).json({ ok: false, error: "CORS: origin not allowed" });
  }
  res.status(err && err.status ? err.status : 500).json({ ok: false, error: err && err.message ? err.message : "Internal server error" });
});

// ---------- Start ----------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
