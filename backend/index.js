const admin = require("firebase-admin");
const { Vonage } = require("@vonage/server-sdk");
const path = require("path");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const serviceAccountPath =
  process.env.SERVICE_ACCOUNT_KEY_PATH || "../serviceAccountKey.json";
const serviceAccount = require(path.resolve(__dirname, serviceAccountPath));

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
