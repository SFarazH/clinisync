import mongoose from "mongoose";

const labWorkSchema = new mongoose.Schema(
  {
    nameOfLab: { type: String, required: true },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    work: { type: String, required: true },
    isReceived: { type: Boolean, requred: true, default: false },
    dateSubmitted: { type: Date, required: true },
    dateExpected: { type: Date, required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.LabWork ||
  mongoose.model("LabWork", labWorkSchema);
