import mongoose from "mongoose";

const prescriptionItemSchema = new mongoose.Schema({
  medicine: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: Number, required: true },
  instructions: { type: String },
});

const prescreptionSchema = new mongoose.Schema({
  medications: {
    type: [prescriptionItemSchema],
    required: true,
  },
  generalNotes: { type: String, required: false },
});

export default mongoose.models.Prescreption ||
  mongoose.model("Prescreption", prescreptionSchema);
