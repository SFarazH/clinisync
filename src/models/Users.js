import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "doctor", "receptionist", "pharmacist"],
      required: true,
    },
    phoneNumber: String,
    gender: String,
    dob: Date,
    address: String,
    
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
