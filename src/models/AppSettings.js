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
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const appSettingsSchema = new mongoose.Schema(
  {
    clinicName: {
      type: String,
      required: true,
      default: "Demo Clinic",
    },
    address: String,
    phone: String,
    email: String,
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
    openingHours: {
      monday: { type: dayScheduleSchema, default: {} },
      tuesday: { type: dayScheduleSchema, default: {} },
      wednesday: { type: dayScheduleSchema, default: {} },
      thursday: { type: dayScheduleSchema, default: {} },
      friday: { type: dayScheduleSchema, default: {} },
      saturday: { type: dayScheduleSchema, default: {} },
      sunday: { type: dayScheduleSchema, default: {} },
    },
  },
  { timestamps: true }
);

export default mongoose.models.AppSettings ||
  mongoose.model("AppSettings", appSettingsSchema);
