import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Callback from "./models/Callback.js";
import nodemailer from "nodemailer";
import twilio from "twilio";

dotenv.config();
const app = express();

app.use(cors({ origin: "*", methods: ["GET", "POST"], credentials: true }));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log("MongoDB Error:", err));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const twilioClient = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

app.post("/api/callbacks", async (req, res) => {
  try {
    const { name, phone, instituteId, instituteName } = req.body;

    const newRequest = new Callback({
      name,
      phone,
      instituteId,
      instituteName,
    });
    await newRequest.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "ayushkasera710@gmail.com",
      subject: `New enquiry from ${instituteName}`,
      text: `New callback request:\n\nName: ${name}\nPhone: ${phone}\nInstitute: ${instituteName}`,
    };
    await transporter.sendMail(mailOptions);

    try {
      await twilioClient.messages.create({
        from: "whatsapp:+14155238886", // Twilio Sandbox Number
        to: "whatsapp:+918800518761", // Aapka Verified Number
        body: `New Lead: ${name} (${phone}) for ${instituteName}`,
      });
      console.log("WhatsApp sent successfully");
    } catch (waError) {
      console.error("WhatsApp Error:", waError.message);
      // WhatsApp fail bhi ho jaye toh lead save ho chuki hai, isliye crash na karein
    }

    res.status(201).json({ message: "Request saved and notifications sent!" });
  } catch (err) {
    console.error("Route Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
