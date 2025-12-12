// const express = require("express");
// const router = express.Router();
// const nodemailer = require("nodemailer");

// router.post("/", async (req, res) => {
//   try {
//     const { nama, email, telepon, subjek, pesan } = req.body || {};
//     if (!nama || !email || !pesan) {
//       return res.status(400).json({ ok: false, error: "Missing required fields" });
//     }

//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       // port: Number(process.env.SMTP_PORT || 465),
//             port: Number(process.env.SMTP_PORT || 587),
//       secure: String(process.env.SMTP_SECURE) === "true",
//       auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
//       logger: true,
//       debug: true,
//     });

//     await new Promise((resolve, reject) => transporter.verify((err, ok) => (err ? reject(err) : resolve(ok))));

//     const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@example.com";
//     const mailOptions = {
//       from: `"Website WMK" <${fromAddress}>`,
//       to: "adminwae@wmk.co.id",
//       subject: `Website Contact — ${subjek || "Pesan baru dari website"}`,
//       text: [
//         `Nama: ${nama}`,
//         `Email: ${email}`,
//         `Telepon: ${telepon || "-"}`,
//         "",
//         "Pesan:",
//         pesan,
//       ].join("\n"),
//       html: `<p><strong>Nama:</strong> ${nama}</p><p><strong>Email:</strong> ${email}</p><p><strong>Telepon:</strong> ${telepon || "-"}</p><hr/><p>${(pesan || "").replace(/\n/g, "<br/>")}</p>`,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log("send-email: email sent");
//     res.json({ ok: true });
//   } catch (err) {
//     console.error("send-email error:", err);
//     const safe = err && err.code ? `${err.code} - ${err.message || "SMTP error"}` : "Gagal mengirim email";
//     res.status(500).json({ ok: false, error: `Gagal mengirim email: ${safe}` });
//   }
// });

// module.exports = router;





// // routes/sendEmail.js (SendGrid)
// const express = require("express");
// const router = express.Router();
// const sgMail = require("@sendgrid/mail");

// if (!process.env.SENDGRID_API_KEY) {
//   console.warn("SENDGRID_API_KEY not set — sendEmail route will fail until configured.");
// } else {
//   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// }

// router.post("/", async (req, res) => {
//   try {
//     const { nama, email, telepon, subjek, pesan } = req.body || {};
//     if (!nama || !email || !pesan) {
//       return res.status(400).json({ ok: false, error: "Missing required fields" });
//     }

//     const from = process.env.SENDGRID_FROM || "no-reply@wmk.co.id";
//     const to = process.env.SENDGRID_TO || "ptwaemandirikarya@wmk.co.id";

//     const msg = {
//       to,
//       from,
//       subject: `Website Contact — ${subjek || "Pesan baru dari website"}`,
//       text: [
//         `Nama: ${nama}`,
//         `Email: ${email}`,
//         `Telepon: ${telepon || "-"}`,
//         "",
//         "Pesan:",
//         pesan,
//       ].join("\n"),
//       html: `<p><strong>Nama:</strong> ${nama}</p>
//              <p><strong>Email:</strong> ${email}</p>
//              <p><strong>Telepon:</strong> ${telepon || "-"}</p>
//              <hr/>
//              <p>${(pesan || "").replace(/\n/g, "<br/>")}</p>`,
//     };

//     await sgMail.send(msg);
//     console.log("send-email (sendgrid): email queued/sent");
//     return res.json({ ok: true });
//   } catch (err) {
//     console.error("send-email (sendgrid) error:", err);
//     // try to extract SendGrid response body if available
//     const detail = err && err.response && err.response.body ? JSON.stringify(err.response.body) : err.message;
//     return res.status(500).json({ ok: false, error: `Gagal mengirim email: ${detail}` });
//   }
// });

// module.exports = router;





// routes/sendEmail.js (SMTP Niagahoster) 🔥 sendEmail.js FULL VERSION (NODemailer + SMTP Niagahoster) bcc
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  try {
    const { nama, email, telepon, subjek, pesan } = req.body || {};
    if (!nama || !email || !pesan) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    // Transporter SMTP Niagahoster
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // mail.wmk.co.id
      port: Number(process.env.SMTP_PORT), // 465
      secure: process.env.SMTP_SECURE === "true", // true
      auth: {
        user: process.env.SMTP_USER, // ptwaemandirikarya@wmk.co.id
        pass: process.env.SMTP_PASS, // password email cPanel
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: "ptwaemandirikarya@wmk.co.id", // inbox Roundcube
      replyTo: email, // biar admin bisa balas langsung ke pengirim
      subject: `Website Contact — ${subjek || "Pesan baru dari website"}`,
      text: [
        `Nama: ${nama}`,
        `Email: ${email}`,
        `Telepon: ${telepon || "-"}`,
        "",
        "Pesan:",
        pesan,
      ].join("\n"),
      html: `<p><strong>Nama:</strong> ${nama}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Telepon:</strong> ${telepon || "-"}</p>
             <hr/>
             <p>${(pesan || "").replace(/\n/g, "<br/>")}</p>`,
    };

    await transporter.sendMail(mailOptions);

    console.log("send-email (niagahoster): SUCCESS");
    return res.json({ ok: true });

  } catch (err) {
    console.error("send-email error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
