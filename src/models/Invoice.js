import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    // income or expense
    transactionType: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    // if for appointment
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },

    // if for lab work
    labWork: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabWork",
    },

    // purpose of payment
    invoiceType: {
      type: String,
      enum: ["appointment", "labWork"],
      required: true,
    },

    // financials
    totalAmount: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      default: 0,
    },
    isPaymentComplete: {
      type: Boolean,
      required: true,
      default: false,
    },

    paymentsHistory: [
      {
        date: { type: Date, required: true, default: Date.now },
        amount: { type: Number, required: true },
        method: {
          type: String,
          enum: ["cash", "card", "online"],
          default: "cash",
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Invoice ||
  mongoose.model("Invoice", InvoiceSchema);
