// server.js
require("dotenv").config({ path: ".env.local" });

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const listFilesRouter = require("./routes/listFiles"); // <- path baru

const app = express();

// sesuaikan origin (development + production)
app.use(cors({
  origin: [ "http://localhost:4000", "https://waemandirikarya-wmk.web.app" ],
  methods: ["GET","POST","OPTIONS"]
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes: mount router ke /listFiles untuk lokal
app.use("/listFiles", listFilesRouter);

app.get("/_health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));




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



