import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
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
    description: String,
    image: String,
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

app.listen(5000, () => console.log("Server running on port 5000"));
