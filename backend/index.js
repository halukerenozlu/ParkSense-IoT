const admin = require("firebase-admin");
const { Vonage } = require("@vonage/server-sdk");
const fs = require("fs");
const path = require("path");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const serviceAccountPath = requireEnv("SERVICE_ACCOUNT_KEY_PATH");
const projectRoot = path.resolve(__dirname, "..");
const resolvedServiceAccountPath = path.isAbsolute(serviceAccountPath)
  ? serviceAccountPath
  : path.resolve(projectRoot, serviceAccountPath);

if (
  !path.isAbsolute(serviceAccountPath) &&
  !resolvedServiceAccountPath.startsWith(`${projectRoot}${path.sep}`)
) {
  throw new Error("SERVICE_ACCOUNT_KEY_PATH must resolve under project root");
}

const serviceAccount = JSON.parse(
  fs.readFileSync(resolvedServiceAccountPath, "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: requireEnv("FIREBASE_DATABASE_URL"),
});

const vonage = new Vonage({
  apiKey: requireEnv("VONAGE_API_KEY"),
  apiSecret: requireEnv("VONAGE_API_SECRET"),
});

const db = admin.database();
const otoparkRef = db.ref("Otopark");

const phoneNumber = requireEnv("PHONE_NUMBER");

otoparkRef.on("value", (snapshot) => {
  const otoparkData = snapshot.val();

  if (!otoparkData || !otoparkData.Durum) {
    console.error("Firebase'den geçersiz bir veri alindi!");
    return;
  }

  const durum = otoparkData.Durum;

  vonage.sms
    .send({
      to: phoneNumber,
      from: "Otopark",
      text: `Otopark durumu: ${durum}`,
    })
    .then((response) => {
      console.log("SMS başariyla gönderildi:", response);
    })
    .catch((error) => {
      console.error("SMS gönderilirken hata oluştu:", error);
    });
});
