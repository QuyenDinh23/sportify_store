import nodemailer from "nodemailer";
import { EMAIL_PASSWORD, EMAIL_USER } from "../config.js";

const USER = EMAIL_USER;
const PASSWORD = EMAIL_PASSWORD;
const transporter = nodemailer.createTransport({
  service: "gmail", // hoặc "hotmail", "yahoo", "outlook"
  auth: {
    user: USER,
    pass: PASSWORD, // KHÔNG phải mật khẩu Gmail thường!
  },
});

const sendMail = async (to, subject, text, html) => {
  const mailOptions = {
    from: `"Sportify Store" <${USER}>`,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
  console.log("✅ Email sent to:", to);
};

export default sendMail;
