const cron = require("node-cron");
const dayjs = require("dayjs");
const Warranty = require("../models/WarrantyItem");
const { sendReminderEmail } = require("../services/mailService");

cron.schedule("0 9 * * *", async () => {
  console.log("Checking warranty reminders...");
  const today = dayjs();

  try {
    const warranties = await Warranty.find().populate("user", "email");

    for (const w of warranties) {
      if (!w.expiryDate || !w.user?.email) continue;

      const expiry = dayjs(w.expiryDate);
      const daysLeft = expiry.diff(today, "day");

      let subject = null;

      if (daysLeft === 30) {
        subject = `Your warranty for ${w.productName} expires in 1 month`;
      } else if (daysLeft === 7) {
        subject = `Your warranty for ${w.productName} expires in 1 week`;
      } else if (daysLeft === 0) {
        subject = `Your warranty for ${w.productName} expires today!`;
      }

      if (subject) {
        await sendReminderEmail(
          w.user.email,
          subject,
          w.productName,
          expiry.format("DD MMM YYYY"),
          daysLeft
        );
      }
    }

    console.log("✅ Reminder check complete");
  } catch (err) {
    console.error("❌ Reminder check failed:", err.message);
  }
});
