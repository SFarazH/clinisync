import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
    default: null,
  },
  databaseName: { type: String, required: true, unique: true },
  plan: { type: String, enum: ["basic", "pro"], default: "basic" },

  features: {
    calendar: { type: Boolean, default: true },
    patients: { type: Boolean, default: true },
    doctors: { type: Boolean, default: true },
    procedures: { type: Boolean, default: true },
    appointments: { type: Boolean, default: true },
    prescriptions: { type: Boolean, default: true },
    settings: { type: Boolean, default: true },
    "lab-work": { type: Boolean, default: false },
    users: { type: Boolean, default: true },
    invoices: { type: Boolean, default: true },
    attachments: { type: Boolean, default: false },
  },

  //trial
  isTrialActive: { type: Boolean, required: true, default: false },
  trialStarted: { type: Date, required: false },
  trailDuration: { type: Number, required: false },

  isClinicActive: { type: Boolean, required: true, default: true },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Clinic || mongoose.model("Clinic", clinicSchema);
