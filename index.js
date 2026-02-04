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

const Institute = mongoose.model(
  "Institute",
  new mongoose.Schema({
    name: String,
    location: String,
    tagline: String,
    description: String,
    image: String,
    rating: Number,
    offerings: [{ name: String, fee: String, duration: String }],
    reviews: [{ user: String, rating: Number, comment: String, date: String }],
  }),
);

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

app.get("/api/institutes", async (req, res) => {
  try {
    const data = await Institute.find();
    res.json(data);
  } catch (err) {
    res.status(500).json([]);
  }
});

app.get("/api/institutes/:id", async (req, res) => {
  try {
    const institute = await Institute.findById(req.params.id);
    if (!institute) return res.status(404).json({ message: "Not found" });
    res.json(institute);
  } catch (err) {
    res.status(500).json({ message: "Invalid ID" });
  }
});

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

    res.status(201).json({ message: "Request saved!" });

    transporter
      .sendMail({
        from: process.env.EMAIL_USER,
        to: "ayushkasera710@gmail.com",
        subject: `New enquiry from ${instituteName}`,
        text: `Name: ${name}\nPhone: ${phone}\nInstitute: ${instituteName}`,
      })
      .catch((err) => console.error("Email Background Error:", err.message));

    twilioClient.messages
      .create({
        from: "whatsapp:+14155238886",
        to: "whatsapp:+918800518761",
        body: `New Lead: ${name} (${phone}) for ${instituteName}`,
      })
      .catch((err) => console.error("WhatsApp Background Error:", err.message));
  } catch (err) {
    console.error("Main Route Error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server Error" });
    }
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
