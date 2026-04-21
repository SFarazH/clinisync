import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: {
      type: String,
      trim: true,
      required: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    age: { type: Number, required: true },
    gender: String,
    dob: Date,
    address: String,
    medicalHistory: String,
    allergies: [String],
  },
  { timestamps: true },
);

export default mongoose.models.Patient ||
  mongoose.model("Patient", patientSchema);
