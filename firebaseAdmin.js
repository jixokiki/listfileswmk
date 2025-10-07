const admin = require("firebase-admin");

function loadServiceAccount() {
const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (base64) {
try {
return JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
} catch (e) {
throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 invalid");
}
}
if (raw) {
try {
return JSON.parse(raw);
} catch (e) {
throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY invalid JSON");
}
}

// fallback for local dev (only if you intentionally put file)
try {
return require("./service-account.json");
} catch (e) {
throw new Error("No service account available. Set FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 or provide service-account.json for dev.");
}
}

const sa = loadServiceAccount();

if (!admin.apps.length) {
admin.initializeApp({
credential: admin.credential.cert(sa),
storageBucket: process.env.FIREBASE_STORAGE_BUCKET // e.g. kbb2-8b930.appspot.com
});
}

const bucket = admin.storage().bucket();
const db = admin.firestore();

module.exports = { admin, bucket, db };



// const admin = require("firebase-admin");

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64)),
//     storageBucket: process.env.FIREBASE_STORAGE_BUCKET
//   });
// }

// const bucket = admin.storage().bucket();

// module.exports = { admin, bucket };
