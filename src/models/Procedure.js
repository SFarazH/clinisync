import mongoose from "mongoose";

const ProcedureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    abbr: {
      type: String,
      unique: true,
      required: false,
    },
    duration: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      required: true,
      match: /^#([0-9a-fA-F]{3}){1,2}$/,
    },
    cost: {
      type: Number,
      required: false,
    },
    canSplit: {
      type: Boolean,
      requred: true,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Procedure ||
  mongoose.model("Procedure", ProcedureSchema);
