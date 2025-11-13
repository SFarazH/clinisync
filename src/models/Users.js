import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: false,
    },
    role: {
      type: String,
      enum: ["super-admin", "admin", "doctor", "receptionist", "pharmacist"],
      required: true,
    },
    phoneNumber: { type: String, required: false },
    gender: String,
    dob: Date,
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: false,
    },
    address: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
