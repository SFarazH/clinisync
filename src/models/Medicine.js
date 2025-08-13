import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String },
  price: { type: Number },
  isDiscontinued: Boolean,
  manufacturerName: { type: String },
  type: String,
  packSize: String,
  shortComposition1: String,
  shortComposition2: String,
});

export default mongoose.models.Medicine ||
  mongoose.model("Medicine", medicineSchema);
