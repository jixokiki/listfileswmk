// routes/listFiles.js
const express = require("express");
const { bucket } = require("../firebaseAdmin");
const router = express.Router();

// router.get("/") karena nanti di server.js kita mount di "/listFiles"
// dan di Vercel kita mount router di "/"
router.get("/", async (req, res) => {
  try {
    const prefix = req.query.prefix || "produk_complus/";
    const [files] = await bucket.getFiles({ prefix });

    const results = await Promise.all(
      files
        .filter((f) => !f.name.endsWith("/"))
        .map(async (f) => {
          const [signedUrl] = await f.getSignedUrl({
            action: "read",
            expires: Date.now() + 60 * 60 * 1000 // 1 hour
          });
          return { name: f.name.split("/").pop(), url: signedUrl, fullPath: f.name };
        })
    );

    res.json(results);
  } catch (err) {
    console.error("listFiles router error:", err && err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
