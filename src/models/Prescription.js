import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
  medicine: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: Number, required: false },
  instructions: { type: String },
});

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    medications: [medicationSchema],
    generalNotes: { type: String },
    delivered: { type: Boolean, default: false },
  },
{ timestamps: true }
);

export default mongoose.models.Prescription ||
  mongoose.model("Prescription", prescriptionSchema);
