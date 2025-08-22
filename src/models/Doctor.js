import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
    },
    specialization: {
      type: String,
      required: false,
    },
    color: {
      type: String,
      default: "#000000",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    dob: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
