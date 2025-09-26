import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config()

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      text,
    });

  } catch (err) {
    console.error("❌ Email not sent:", err.message);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;
