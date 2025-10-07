// const express = require("express");
// const router = express.Router();
// const { bucket } = require("../firebaseAdmin");

// router.get("/", async (req, res) => {
// try {
// const prefix = req.query.prefix || "produk_complus/"; // optional override via query
// const [files] = await bucket.getFiles({ prefix });

// const results = await Promise.all(
//   files
//     .filter((f) => !f.name.endsWith("/"))
//     .map(async (f) => {
//       // signed URL 1 jam
//       const [signedUrl] = await f.getSignedUrl({
//         action: "read",
//         expires: Date.now() + 60 * 60 * 1000
//       });
//       return { name: f.name.split("/").pop(), url: signedUrl, fullPath: f.name };
//     })
// );

// res.json(results);


// } catch (err) {
// console.error("listFiles error:", err && err.message);
// res.status(500).json({ error: "Internal server error" });
// }
// });

// module.exports = router;










//jangan dihapus ini yang dipakai 
// const express = require("express");
// const router = express.Router();
// const { bucket } = require("../firebaseAdmin");

// // Middleware CORS khusus route ini
// router.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "https://waemandirikarya-wmk.web.app");
//   res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
//   // tanggapi preflight
//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }

//   next();
// });

// router.get("/", async (req, res) => {
//   try {
//     const prefix = req.query.prefix || "produk_complus/"; // optional override via query
//     const [files] = await bucket.getFiles({ prefix });

//     const results = await Promise.all(
//       files
//         .filter((f) => !f.name.endsWith("/"))
//         .map(async (f) => {
//           const [signedUrl] = await f.getSignedUrl({
//             action: "read",
//             expires: Date.now() + 60 * 60 * 1000
//           });
//           return { name: f.name.split("/").pop(), url: signedUrl, fullPath: f.name };
//         })
//     );

//     res.json(results);

//   } catch (err) {
//     console.error("listFiles error:", err && err.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// module.exports = router;



// const express = require("express");
// const serverless = require("serverless-http"); // agar bisa di Vercel
// const { bucket } = require("../firebaseAdmin");

// const app = express();

// // Middleware CORS
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "https://waemandirikarya-wmk.web.app");
//   res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }
//   next();
// });

// app.get("/listFiles", async (req, res) => {
//   try {
//     const prefix = req.query.prefix || "produk_complus/";
//     const [files] = await bucket.getFiles({ prefix });

//     const results = await Promise.all(
//       files
//         .filter((f) => !f.name.endsWith("/"))
//         .map(async (f) => {
//           const [signedUrl] = await f.getSignedUrl({
//             action: "read",
//             expires: Date.now() + 60 * 60 * 1000
//           });
//           return { name: f.name.split("/").pop(), url: signedUrl, fullPath: f.name };
//         })
//     );

//     res.json(results);
//   } catch (err) {
//     console.error("listFiles error:", err.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Export untuk Vercel
// module.exports = app;
// module.exports.handler = serverless(app);


// api/listFiles.js
const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const listFilesRouter = require("../routes/listFiles");

const app = express();

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://waemandirikarya-wmk.web.app";

app.use(cors({
  origin: ALLOWED_ORIGIN,
  methods: ["GET","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// mount router at root because Vercel will mount this file to /api/listFiles
app.use("/", listFilesRouter);

// health (optional)
app.get("/_health", (req, res) => res.json({ ok: true }));

module.exports = app;
module.exports.handler = serverless(app);




// import { Storage } from "@google-cloud/storage";

// const storage = new Storage({
//   projectId: process.env.FIREBASE_PROJECT_ID,
//   credentials: JSON.parse(
//     Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, "base64").toString("utf8")
//   ),
// });

// const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);

// export default async function handler(req, res) {
//   try {
//     const [files] = await bucket.getFiles({ prefix: "produk_complus/" });
//     const urls = files.map(f => ({
//       name: f.name,
//       url: `https://storage.googleapis.com/${bucket.name}/${f.name}`,
//     }));
//     res.status(200).json(urls);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }
