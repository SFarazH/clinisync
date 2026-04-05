import mongoose, { Schema } from "mongoose";

const StatusTimelineSchema = new Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Number, required: true },
  },
  { _id: false },
);

const ErrorSchema = new Schema(
  {
    code: { type: Number },
    type: { type: String },
    message: { type: String },
    error_subcode: { type: String },
    error_data: {
      messaging_product: { type: String },
      details: { type: String },
    },
    fbtrace_id: { type: String },
  },
  { _id: false },
);

const WhatsappMessageSchema = new Schema(
  {
    messageId: { type: String, required: true, unique: true },
    conversationId: { type: String },

    // users
    from: { type: String },
    to: { type: String },
    waId: { type: String, required: true },

    direction: {
      type: String,
      enum: ["incoming", "outgoing"],
      required: true,
    },

    template: {
      type: String,
      required: false,
    },

    type: {
      type: String,
      enum: [
        "text",
        "image",
        "video",
        "audio",
        "document",
        "sticker",
        "location",
        "contacts",
        "reaction",
        "button",
        "interactive",
      ],

      required: false,
    },

    status: {
      type: String,
      enum: ["accepted", "sent", "delivered", "read", "failed"],
      default: "accepted",
    },

    content: Schema.Types.Mixed,
    statusTimeline: [StatusTimelineSchema],

    recipientId: { type: String },
    contactProfileName: {
      //contacts.profile.name
      name: { type: String },
    },

    pricing: {
      billable: { type: Boolean },
      category: { type: String },
      pricingModel: { type: String },
      type: { type: String },
    },

    metadata: {
      phoneNumberId: { type: String },
      displayPhoneNumber: { type: String },
    },

    // clinisync specific
    clinicId: {
      type: String,
      ref: "Clinic",
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },

    rawPayload: {
      type: Object,
    },

    error: ErrorSchema,
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.WhatsappMessage ||
  mongoose.model("WhatsappMessage", WhatsappMessageSchema);
