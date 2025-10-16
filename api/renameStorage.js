// // pages/api/renameStorage.js
// import { Storage } from "@google-cloud/storage";

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const { oldPath, newPath } = req.body;
//     if (!oldPath || !newPath) {
//       return res.status(400).json({ error: "oldPath and newPath are required" });
//     }

//     // konfigurasi Storage: gunakan GOOGLE_APPLICATION_CREDENTIALS atau FIREBASE_SERVICE_ACCOUNT_KEY_BASE64
//     let storage;
//     if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64) {
//       const credentials = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, "base64").toString("utf8"));
//       storage = new Storage({ projectId: credentials.project_id, credentials });
//     } else {
//       storage = new Storage(); // fallback ke ADC
//     }

//     const bucketName = process.env.FIREBASE_STORAGE_BUCKET || process.env.GCLOUD_STORAGE_BUCKET;
//     if (!bucketName) {
//       return res.status(500).json({ error: "Missing bucket env var" });
//     }

//     const bucket = storage.bucket(bucketName);
//     const srcFile = bucket.file(oldPath);
//     const destFile = bucket.file(newPath);

//     // Pastikan file sumber ada
//     const [exists] = await srcFile.exists();
//     if (!exists) {
//       return res.status(404).json({ error: "Source file not found" });
//     }

//     // Copy file ke path baru
//     await srcFile.copy(destFile);

//     // Optional: set public read (jika sebelumnya public)
//     // await destFile.makePublic();

//     // Hapus file lama setelah copy sukses
//     await srcFile.delete();

//     // Dapatkan URL download (signedURL atau public URL tergantung setup)
//     let downloadUrl;
//     // Jika bucket di-set public oleh rules, kamu bisa gunakan public URL:
//     downloadUrl = `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(newPath)}`;

//     // Jika bucket tidak public, kamu bisa buat signed URL:
//     // const [signedUrl] = await destFile.getSignedUrl({ action: "read", expires: Date.now() + 7 * 24 * 60 * 60 * 1000 });
//     // downloadUrl = signedUrl;

//     return res.status(200).json({ ok: true, downloadUrl, path: newPath });
//   } catch (err) {
//     console.error("renameStorage error:", err);
//     return res.status(500).json({ error: String(err?.message || err) });
//   }
// }




// contoh sederhana Express + @google-cloud/storage
const express = require("express");
const { Storage } = require("@google-cloud/storage");
const app = express();
app.use(express.json());

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: JSON.parse(process.env.SERVICE_ACCOUNT_JSON),
});
const bucketName = process.env.FIREBASE_STORAGE_BUCKET; // mis: "project-id.appspot.com"
const bucket = storage.bucket(bucketName);

app.post("/api/renameStorage", async (req, res) => {
  try {
    const { oldPath, newPath } = req.body;
    if (!oldPath || !newPath) return res.status(400).json({ error: "oldPath & newPath required" });

    const src = bucket.file(oldPath);
    const dest = bucket.file(newPath);

    // copy lalu delete
    await src.copy(dest);
    await src.delete();

    // buat public URL (jika bucket public) atau gunakan signedUrl jika tidak public
    const downloadUrl = `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(newPath)}`;

    res.json({ success: true, downloadUrl });
  } catch (e) {
    console.error("renameStorage error:", e);
    res.status(500).json({ error: e.message });
  }
});

// start server pada environment yang sesuai
module.exports = app;
