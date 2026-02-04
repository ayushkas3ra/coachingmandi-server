import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

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

app.get("api/institutes/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const institute = await Institute.findById;

    if (!institute) {
      return res.status(404).json({ message: "Institute not found." });
    }
    res.json(institute);
  } catch (err) {
    console.error("Error fetching institute", err);
    res.status(500).json({ message: "Server is invalid." });
  }
});

app.listen(process.env.PORT || 5000, () =>
  console.log("Server running on port ${PORT}"),
);
