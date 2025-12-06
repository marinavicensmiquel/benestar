const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

// === 1️⃣ Save user token and frequency ===
exports.registerUser = functions.https.onRequest(async (req, res) => {
  try {
    const { token, frequency } = req.body;
    if (!token || !frequency) {
      return res.status(400).json({ success: false, error: "Missing token or frequency" });
    }

    await db.collection("users").doc(token).set({
      frequency,
      lastSent: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.json({ success: true });
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ success: false });
  }
});

// === 2️⃣ Periodically send notifications ===
exports.sendNotifications = functions.pubsub.schedule("every 5 minutes").onRun(async (context) => {
  const now = new Date();
  const snapshot = await db.collection("users").get();

  const messages = [
    "M’estim 💚", "M’estimem 🌿", "Som una afortunada de la vida ✨",
    "Som agraïda 💫", "Som feliç 🌸", "Som lliure 🌞"
  ];

  const batch = [];

  snapshot.forEach(doc => {
    const user = doc.data();
    const lastSent = user.lastSent?.toDate?.() || new Date(0);
    const minutesElapsed = (now - lastSent) / (1000 * 60);

    if (minutesElapsed >= user.frequency) {
      const msg = messages[Math.floor(Math.random() * messages.length)];

      batch.push({
        token: doc.id,
        notification: {
          title: "💫 Benestar",
          body: msg,
          icon: "https://marinavicensmiquel.github.io/benestar/icon-192.png"
        }
      });

      // Update lastSent
      db.collection("users").doc(doc.id).update({
        lastSent: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

  if (batch.length > 0) {
    const response = await admin.messaging().sendEach(batch);
    console.log(`Sent ${batch.length} notifications.`);
  }

  return null;
});

