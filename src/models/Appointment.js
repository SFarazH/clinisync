import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: false },
    s3FileKey: { type: String, required: false },
  },
  { timestamps: true },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    procedureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Procedure",
      required: true,
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["scheduled", "cancelled", "completed", "missed"],
      default: "scheduled",
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      required: false,
      default: null,
    },
    attachments: [attachmentSchema],
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: false,
      default: null,
    },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);
