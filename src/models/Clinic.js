import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    start: { type: String }, 
    end: { type: String },
  },
  { _id: false }
);

const dayScheduleSchema = new mongoose.Schema(
  {
    morning: { type: shiftSchema, default: {} },
    afternoon: { type: shiftSchema, default: {} },
    break: { type: shiftSchema, default: {} },
  },
  { _id: false }
);

const clinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: String,
    contactNumber: String,
    openingHours: {
      monday: { type: dayScheduleSchema, default: {} },
      tuesday: { type: dayScheduleSchema, default: {} },
      wednesday: { type: dayScheduleSchema, default: {} },
      thursday: { type: dayScheduleSchema, default: {} },
      friday: { type: dayScheduleSchema, default: {} },
      saturday: { type: dayScheduleSchema, default: {} },
      sunday: { type: dayScheduleSchema, default: {} },
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Clinic || mongoose.model("Clinic", clinicSchema);
