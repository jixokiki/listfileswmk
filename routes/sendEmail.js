const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  try {
    const { nama, email, telepon, subjek, pesan } = req.body || {};
    if (!nama || !email || !pesan) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE) === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      logger: true,
      debug: true,
    });

    await new Promise((resolve, reject) => transporter.verify((err, ok) => (err ? reject(err) : resolve(ok))));

    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@example.com";
    const mailOptions = {
      from: `"Website WMK" <${fromAddress}>`,
      to: "adminwae@wmk.co.id",
      subject: `Website Contact — ${subjek || "Pesan baru dari website"}`,
      text: [
        `Nama: ${nama}`,
        `Email: ${email}`,
        `Telepon: ${telepon || "-"}`,
        "",
        "Pesan:",
        pesan,
      ].join("\n"),
      html: `<p><strong>Nama:</strong> ${nama}</p><p><strong>Email:</strong> ${email}</p><p><strong>Telepon:</strong> ${telepon || "-"}</p><hr/><p>${(pesan || "").replace(/\n/g, "<br/>")}</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("send-email: email sent");
    res.json({ ok: true });
  } catch (err) {
    console.error("send-email error:", err);
    const safe = err && err.code ? `${err.code} - ${err.message || "SMTP error"}` : "Gagal mengirim email";
    res.status(500).json({ ok: false, error: `Gagal mengirim email: ${safe}` });
  }
});

module.exports = router;
