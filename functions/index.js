const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.subscribeToAll = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const token = req.query.token || req.body?.token;
    if (!token) {
      return res.status(400).json({ success: false, error: "No token provided" });
    }

    try {
      await admin.messaging().subscribeToTopic(token, "all");
      console.log(`✅ Subscribed ${token} to topic 'all'`);
      res.json({ success: true });
    } catch (error) {
      console.error("❌ Error subscribing to topic:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});

exports.sendNotification = functions.https.onRequest(async (req, res) => {
  const { title = "Benestar Reminder", body = "It’s time for your wellbeing check 🌿", icon = "icon-192.png" } = req.body || {};

  try {
    await admin.messaging().send({
      topic: "all",
      notification: { title, body },
      webpush: {
        notification: { icon },
      },
      android: {
        notification: { icon },
      },
    });

    console.log(`🚀 Notification sent: ${title}`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
