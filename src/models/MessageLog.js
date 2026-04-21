import mongoose from "mongoose";

const messageLogSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
      index: true,
    },

    // which template was used
    template: {
      type: String,
      required: true,
    },

    // status of message
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
      index: true,
    },

    scheduledFor: {
      type: Date,
      required: true,
      index: true,
    },

    sentAt: {
      type: Date,
    },

    error: {
      type: String,
    },
  },
  { timestamps: true },
);

// 🔒 Prevent duplicate sends
messageLogSchema.index(
  { appointmentId: 1, template: 1, scheduledFor: 1 },
  { unique: true },
);

export default mongoose.models.MessageLog ||
  mongoose.model("MessageLog", messageLogSchema);
