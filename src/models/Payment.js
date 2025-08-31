import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      default: 0,
    },
    amountPending: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentsHistory: [
      {
        date: { type: Date, required: true, default: Date.now },
        amount: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);
