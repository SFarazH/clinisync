import mongoose from "mongoose";

const cronLogSchema = new mongoose.Schema(
  {
    startedAt: {
      type: Date,
      required: true,
    },

    completedAt: {
      type: Date,
    },

    durationMs: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["running", "success", "failed"],
      default: "running",
    },

    metrics: {
      clinicsProcessed: {
        type: Number,
        default: 0,
      },
      totalAppointments: {
        type: Number,
        default: 0,
      },
      totalAttempted: {
        type: Number,
        default: 0,
      },
      totalSent: {
        type: Number,
        default: 0,
      },
      totalFailed: {
        type: Number,
        default: 0,
      },
      totalSkipped: {
        type: Number,
        default: 0,
      },
    },

    error: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.models.CronLog ||
  mongoose.model("CronLog", cronLogSchema);
