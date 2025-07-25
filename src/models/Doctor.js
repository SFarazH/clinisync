import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      unique: true,
    },
    phone: {
      type: String,
      unique: true,
    },
    color: {
      type: String,
      default: "#000000",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
