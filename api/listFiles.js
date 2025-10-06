const express = require("express");
const router = express.Router();
const { bucket } = require("../firebaseAdmin");

router.get("/", async (req, res) => {
try {
const prefix = req.query.prefix || "produk_complus/"; // optional override via query
const [files] = await bucket.getFiles({ prefix });

const results = await Promise.all(
  files
    .filter((f) => !f.name.endsWith("/"))
    .map(async (f) => {
      // signed URL 1 jam
      const [signedUrl] = await f.getSignedUrl({
        action: "read",
        expires: Date.now() + 60 * 60 * 1000
      });
      return { name: f.name.split("/").pop(), url: signedUrl, fullPath: f.name };
    })
);

res.json(results);


} catch (err) {
console.error("listFiles error:", err && err.message);
res.status(500).json({ error: "Internal server error" });
}
});

module.exports = router;



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
