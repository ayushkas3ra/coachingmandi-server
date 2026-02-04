import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Callback from "./models/Callback.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  }),
);
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

app.get("/api/institutes", async (req, res) => {
  try {
    const data = await Institute.find();
    console.log(`Fetched ${data.length} institutes`);
    res.json(data);
  } catch (err) {
    res.status(500).json([]);
  }
});

app.get("/api/institutes/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const institute = await Institute.findById(req.params.id);

    if (!institute) {
      return res.status(404).json({ message: "Institute not found." });
    }
    res.json(institute);
  } catch (err) {
    console.error("Error fetching institute", err);
    res.status(500).json({ message: "Server is invalid." });
  }
});

app.post("/api/callbacks", async (req, res) => {
  console.log("Request Received:", req.body);
  try {
    const { name, phone, instituteId, instituteName } = req.body;

    const newRequest = new Callback({
      name,
      phone,
      instituteId,
      instituteName,
    });

    await newRequest.save();
    console.log("Saved to MongoDB");
    res.status(201).json({ message: "Request saved!" });
  } catch (err) {
    console.error("Save Error:", err.message); // Ye Render logs mein dikhega
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
