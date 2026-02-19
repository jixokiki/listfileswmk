const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

router.post("/", async (req, res) => {
  try {
    const { nama, kontak, tanggal, jam, durasi, lokasi, keperluan, bookingId, bookingLink } = req.body || {};
    if (!nama || !tanggal) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    // Email ke Admin
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: "ptwaemandirikarya@wmk.co.id",
      subject: "Booking Konsultasi Baru (Admin)",
      html: `
        <h3>Ada booking konsultasi baru:</h3>
        <p><strong>Nama:</strong> ${nama}</p>
        <p><strong>Kontak:</strong> ${kontak}</p>
        <p><strong>Tanggal:</strong> ${tanggal}</p>
        <p><strong>Jam:</strong> ${jam}</p>
        <p><strong>Durasi:</strong> ${durasi} menit</p>
        <p><strong>Lokasi:</strong> ${lokasi}</p>
        <p><strong>Keperluan:</strong> ${keperluan}</p>
        <p><strong>ID Booking:</strong> ${bookingId}</p>
        <p><strong>Link:</strong> <a href="${bookingLink}">${bookingLink}</a></p>
      `,
    });

    console.log("Booking email terkirim ke admin");
    return res.json({ ok: true });
  } catch (err) {
    console.error("sendBooking error:", err.message);
    return res.status(500).json({ ok: false, error: "Failed to send booking email" });
  }
});

module.exports = router;