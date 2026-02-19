// const nodemailer = require('nodemailer');
// const t = nodemailer.createTransport({
//   host: 'mail.wmk.co.id',
//   port: 465,
//   secure: true,
//   auth: {
//     user: 'ptwaemandirikarya@wmk.co.id',
//     pass: 'RiW0_A#nBhoS!X=z'
//   }
// });
// t.verify()
//   .then(() => console.log('SMTP OK ✅'))
//   .catch(err => console.error('SMTP ERROR ❌:', err.message));



// const nodemailer = require('nodemailer');
// const t = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false,
//   auth: {
//     user: 'rrizki402@gmail.com',       // ← ganti email Gmail kamu
//     pass: 'zhgp irgv yrxt ltku'        // ← app password tadi
//   }
// });
// t.verify()
//   .then(() => console.log('SMTP OK ✅'))
//   .catch(err => console.error('SMTP ERROR ❌:', err.message));



const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'rrizki402@gmail.com',
    pass: 'zhgp irgv yrxt ltku'
  }
});
t.sendMail({
  from: 'Website WMK <rrizki402@gmail.com>',
  to: 'ptwaemandirikarya@wmk.co.id',
  subject: 'Test dari website WMK',
  text: 'Halo, ini test email dari website WMK.'
}).then(() => console.log('Email terkirim ✅'))
  .catch(err => console.error('Gagal:', err.message));