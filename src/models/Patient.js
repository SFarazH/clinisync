import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true },
    phoneNumber: String,
    age:Number,
    gender: String,
    dob: Date,
    address: String,
    medicalHistory: String,
    allergies: [String],
  },
  { timestamps: true }
);

export default mongoose.models.Patient ||
  mongoose.model("Patient", patientSchema);
