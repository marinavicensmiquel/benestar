const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// ✅ Securely subscribe a client token to the topic "all"
exports.subscribeToAll = functions.https.onRequest(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ success: false, error: "Missing token" });
  }

  try {
    await admin.messaging().subscribeToTopic(token, "all");
    console.log(`🔗 Token subscribed to 'all'`);
    res.json({ success: true, message: "Subscribed to topic 'all'" });
  } catch (error) {
    console.error("❌ Subscription error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Existing endpoint — sends notification to all subscribed tokens
exports.sendNotification = functions.https.onRequest(async (req, res) => {
  const { title = "Benestar Reminder", body = "It’s time for your wellbeing check 🌿" } = req.query;
  try {
    await admin.messaging().send({
      topic: "all",
      notification: { title, body, icon: "icon-192.png" },
    });
    console.log(`🚀 Notification sent: ${title}`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
