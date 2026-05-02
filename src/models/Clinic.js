import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema(
  {
    clinicName: { type: String, required: true },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    databaseName: { type: String, required: true, unique: true },
    plan: { type: String, enum: ["basic", "pro"], default: "basic" },

    features: {
      calendar: { type: Boolean, default: true },
      patients: { type: Boolean, default: true },
      doctors: { type: Boolean, default: true },
      procedures: { type: Boolean, default: true },
      appointments: { type: Boolean, default: true },
      prescriptions: { type: Boolean, default: true },
      settings: { type: Boolean, default: true },
      "lab-work": { type: Boolean, default: false },
      users: { type: Boolean, default: true },
      invoices: { type: Boolean, default: true },
      attachments: { type: Boolean, default: false },
      "whatsapp-reminders": { type: Boolean, default: false },
    },
    isClinicActive: { type: Boolean, required: true, default: true },

    //contact details
    phone: {
      type: String,
      trim: true,
      required: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    email: { type: String, trim: true },

    // for google map
    googleMapsLink: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^https?:\/\/(www\.)?(google\.[a-z.]+\/maps\/.+|maps\.app\.goo\.gl\/.+)/.test(
            v,
          );
        },
        message: "Enter a valid Google Maps URL",
      },
    },

    // required for whatsapp message with location
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },

    // address
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine2: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    postalCode: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
      default: "India",
    },

    whatsappTemplate: {
      type: String,
      required: false,
      default: "clinisync_appointment",
    },
    whatsappMsgFrequency: {
      onBooking: {
        type: Boolean,
        default: false,
      },
      onAppointmentDay: {
        type: Boolean,
        default: false,
      },
    },

    //trial
    isTrialActive: { type: Boolean, required: true, default: false },
    trialStarted: { type: Date, required: false },
    trailDuration: { type: Number, required: false },

    isLiveClinic: { type: Boolean, required: true, default: false },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.models.Clinic || mongoose.model("Clinic", clinicSchema);
