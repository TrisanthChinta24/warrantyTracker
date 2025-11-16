const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or use SMTP for production
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendReminderEmail(to, subject, productName, expiryDate, daysLeft) {
  const html = `
    <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 20px; border-radius: 8px;">
      <h2 style="color: #ff6b6b;">Warranty Reminder</h2>
      <p>Hello,</p>
      <p>This is a reminder that your <strong>${productName}</strong> warranty 
      ${daysLeft > 0 ? `will expire in <strong>${daysLeft}</strong> days` : `<strong>expires today!</strong>`}.</p>
      <p><b>Expiry Date:</b> ${expiryDate}</p>
      <div style="background: #e5e7eb; border-radius: 8px; width: 100%; height: 10px; margin-top: 10px;">
        <div style="background: #ff6b6b; width: ${Math.min(
          ((365 - daysLeft) / 365) * 100,
          100
        )}%; height: 10px; border-radius: 8px;"></div>
      </div>
      <p style="margin-top: 10px;">Check your full warranty details in the <a href="https://your-frontend-domain.com" style="color: #ff6b6b;">Warranty Tracker App</a>.</p>
      <p>— The Warranty Tracker Team</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Warranty Tracker" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}


module.exports = { sendReminderEmail };
