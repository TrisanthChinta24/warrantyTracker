const express = require("express");
const router = express.Router();
const { sendReminderEmail } = require("../services/mailService");

router.get("/send-test", async (req, res) => {
  try {
    await sendReminderEmail(
      "trisanthtrishu@gmail.com",
      "Test Warranty Tracker Mail",
      "✅ Your warranty email setup works perfectly!"
    );
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
