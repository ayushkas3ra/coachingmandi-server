import mongoose from "mongoose";

const callbackSchema = new mongoose.Schema({
  name: String,
  phone: String,
  instituteId: String,
  instituteName: String,
  date: { type: Date, default: Date.now },
});

export default mongoose.models.Callback ||
  mongoose.model("Callback", callbackSchema);
