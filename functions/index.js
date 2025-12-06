const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// ✅ Securely subscribe a client token to the topic "all"
exports.subscribeToAll = functions.https.onRequest(async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).json({ success: false, error: "Missing token" });

  try {
    await admin.messaging().subscribeToTopic(token, "all");
    res.json({ success: true, message: "Subscribed to topic 'all'" });
  } catch (err) {
    console.error("❌ Error subscribing to topic:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Existing endpoint — sends notification to all subscribed tokens
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
