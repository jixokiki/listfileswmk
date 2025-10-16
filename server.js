// // server.js ( ini code yang bener yaa bukan yang di paling bawah)
// require("dotenv").config({ path: ".env.local" });

// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const listFilesRouter = require("./routes/listFiles"); // <- path baru

// // tambahan: google storage
// const { Storage } = require("@google-cloud/storage");

// const app = express();

// // sesuaikan origin (development + production)
// app.use(cors({
//   origin: [ "http://localhost:4000", "https://waemandirikarya-wmk.web.app" ],
//   methods: ["GET","POST","OPTIONS"]
// }));

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // routes: mount router ke /listFiles untuk lokal
// app.use("/listFiles", listFilesRouter);

// // === START: tambahan route renameStorage dan helper storage ===

// // Helper: buat instance Storage dengan dua opsi auth:
// // - pakai FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 (base64 service account JSON), atau
// // - fallback ke Google ADC (GOOGLE_APPLICATION_CREDENTIALS)
// function makeStorage() {
//   if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64) {
//     const credsJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, "base64").toString("utf8");
//     const credentials = JSON.parse(credsJson);
//     return new Storage({ projectId: credentials.project_id, credentials });
//   }
//   // fallback (jika GOOGLE_APPLICATION_CREDENTIALS diset atau di environment GCP)
//   return new Storage();
// }

// /**
//  * Rename file di bucket: copy -> delete
//  * @param {String} bucketName
//  * @param {String} oldPath
//  * @param {String} newPath
//  * @returns {Object} { downloadUrl, path }
//  */
// async function renameInBucket(bucketName, oldPath, newPath) {
//   const storage = makeStorage();
//   const bucket = storage.bucket(bucketName);

//   const srcFile = bucket.file(oldPath);
//   const destFile = bucket.file(newPath);

//   // cek existence sumber
//   const [exists] = await srcFile.exists();
//   if (!exists) {
//     const e = new Error("Source file tidak ditemukan di bucket");
//     e.code = 404;
//     throw e;
//   }

//   // copy
//   await srcFile.copy(destFile);

//   // hapus sumber setelah copy sukses
//   await srcFile.delete();

//   // public URL sederhana (jika bucket public)
//   const downloadUrl = `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(newPath)}`;

//   // jika bucket private: pertimbangkan membuat signed URL di sini
//   return { downloadUrl, path: newPath };
// }

// // Route POST /api/renameStorage
// app.post("/api/renameStorage", async (req, res) => {
//   try {
//     const { oldPath, newPath } = req.body;
//     if (!oldPath || !newPath) {
//       return res.status(400).json({ error: "oldPath dan newPath wajib dikirim" });
//     }

//     const bucketName = process.env.FIREBASE_STORAGE_BUCKET || process.env.GCLOUD_STORAGE_BUCKET;
//     if (!bucketName) {
//       return res.status(500).json({ error: "Missing bucket env var (FIREBASE_STORAGE_BUCKET)" });
//     }

//     // jalankan rename
//     const result = await renameInBucket(bucketName, oldPath, newPath);

//     return res.json({ ok: true, ...result });
//   } catch (err) {
//     console.error("renameStorage error:", err);
//     const status = err.code === 404 ? 404 : 500;
//     return res.status(status).json({ error: err.message || String(err) });
//   }
// });

// // === END: tambahan route renameStorage ===

// app.get("/_health", (req, res) => res.json({ ok: true }));

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));


















// server.js ini code update an terbaru dari yang sudah bener di paling atas sebelumnya
require("dotenv").config({ path: ".env.local" });

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const listFilesRouter = require("./routes/listFiles"); // <- path baru
const sendEmailRouter = require("./routes/sendEmail"); // <-- ADDED

// tambahan: google storage
const { Storage } = require("@google-cloud/storage");

const app = express();

// sesuaikan origin (development + production)
// app.use(cors({
//   origin: [ "http://localhost:4000", "https://waemandirikarya-wmk.web.app", "http://localhost:3000" ],
//   methods: ["GET","POST","OPTIONS"]
// }));

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4000",
  "https://waemandirikarya-wmk.web.app" // <-- penting
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser requests like curl/postman
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","X-Requested-With"],
  optionsSuccessStatus: 200
}));

// Make sure preflight requests are handled
app.options("*", (req, res) => res.sendStatus(200));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes: mount router ke /listFiles untuk lokal
app.use("/listFiles", listFilesRouter);

// mount send-email router (ditambahkan)
app.use("/api/send-email", sendEmailRouter);

// === START: tambahan route renameStorage dan helper storage ===

// Helper: buat instance Storage dengan dua opsi auth:
// - pakai FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 (base64 service account JSON), atau
// - fallback ke Google ADC (GOOGLE_APPLICATION_CREDENTIALS)
function makeStorage() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64) {
    const credsJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, "base64").toString("utf8");
    const credentials = JSON.parse(credsJson);
    return new Storage({ projectId: credentials.project_id, credentials });
  }
  // fallback (jika GOOGLE_APPLICATION_CREDENTIALS diset atau di environment GCP)
  return new Storage();
}

/**
 * Rename file di bucket: copy -> delete
 * @param {String} bucketName
 * @param {String} oldPath
 * @param {String} newPath
 * @returns {Object} { downloadUrl, path }
 */
async function renameInBucket(bucketName, oldPath, newPath) {
  const storage = makeStorage();
  const bucket = storage.bucket(bucketName);

  const srcFile = bucket.file(oldPath);
  const destFile = bucket.file(newPath);

  // cek existence sumber
  const [exists] = await srcFile.exists();
  if (!exists) {
    const e = new Error("Source file tidak ditemukan di bucket");
    e.code = 404;
    throw e;
  }

  // copy
  await srcFile.copy(destFile);

  // hapus sumber setelah copy sukses
  await srcFile.delete();

  // public URL sederhana (jika bucket public)
  const downloadUrl = `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(newPath)}`;

  // jika bucket private: pertimbangkan membuat signed URL di sini
  return { downloadUrl, path: newPath };
}

// Route POST /api/renameStorage
app.post("/api/renameStorage", async (req, res) => {
  try {
    const { oldPath, newPath } = req.body;
    if (!oldPath || !newPath) {
      return res.status(400).json({ error: "oldPath dan newPath wajib dikirim" });
    }

    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || process.env.GCLOUD_STORAGE_BUCKET;
    if (!bucketName) {
      return res.status(500).json({ error: "Missing bucket env var (FIREBASE_STORAGE_BUCKET)" });
    }

    // jalankan rename
    const result = await renameInBucket(bucketName, oldPath, newPath);

    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error("renameStorage error:", err);
    const status = err.code === 404 ? 404 : 500;
    return res.status(status).json({ error: err.message || String(err) });
  }
});

// === END: tambahan route renameStorage ===

app.get("/_health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));




// ini file yang udah bener aman berjalan // server.js
// require("dotenv").config({ path: ".env.local" });

// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const listFilesRouter = require("./routes/listFiles"); // <- path baru

// const app = express();

// // sesuaikan origin (development + production)
// app.use(cors({
//   origin: [ "http://localhost:4000", "https://waemandirikarya-wmk.web.app" ],
//   methods: ["GET","POST","OPTIONS"]
// }));

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // routes: mount router ke /listFiles untuk lokal
// app.use("/listFiles", listFilesRouter);

// app.get("/_health", (req, res) => res.json({ ok: true }));

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));




// require("dotenv").config({ path: ".env.local" });

// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const listFilesRouter = require("./api/listFiles");
// // const uploadImageRouter = require("./routes/upload-image"); // optional jika mau
// // const uploadProdukRouter = require("./routes/upload-produk"); // optional

// const app = express();

// // sesuaikan origin (development + production)
// app.use(cors({
// origin: [ "http://localhost:4000", "[https://waemandirikarya-wmk.web.app](https://waemandirikarya-wmk.web.app)" ],
// methods: ["GET","POST","OPTIONS"]
// }));

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // routes
// app.use("/listFiles", listFilesRouter);
// // app.use("/upload-image", uploadImageRouter);
// // app.use("/upload-produk", uploadProdukRouter);

// app.get("/_health", (req, res) => res.json({ ok: true }));

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));



