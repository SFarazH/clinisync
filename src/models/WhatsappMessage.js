import mongoose from "mongoose";

const WhatsappMessageSchema = new mongoose.Schema(
  {
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
    },
    messageSid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    accountSid: {
      type: String,
      required: true,
    },

    body: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },

    messageType: {
      type: String,
    },

    direction: {
      type: String,
      enum: ["outbound-api", "inbound"],
    },
    status: {
      type: String,
      enum: [
        "queued",
        "sent",
        "delivered",
        "read",
        "failed",
        "undelivered",
        "received",
      ],
    },

    errorCode: {
      type: Number,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },

    dateCreated: {
      type: Date,
      required: true,
    },

    //outgoing specific
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },

    // incoming specific
    profileName: {
      type: String,
      required: false,
    },
    waId: {
      type: String,
      required: false,
    },

    numMedia: {
      type: Number,
    },
    mediaUrl: {
      type: String,
    },
    rawPayload: {
      type: Object,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.WhatsappMessage ||
  mongoose.model("WhatsappMessage", WhatsappMessageSchema);
