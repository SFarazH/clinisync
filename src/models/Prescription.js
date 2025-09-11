import mongoose from "mongoose";

const medicineItemSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  shortComposition1: { type: String, required: false, default: "" },
  shortComposition2: { type: String, required: false, default: "" },
});

const medicationSchema = new mongoose.Schema({
  medicine: medicineItemSchema,
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
