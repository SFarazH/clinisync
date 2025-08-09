import mongoose from "mongoose";

const prescreptionSchema = new mongoose.Schema({
  
});

export default mongoose.models.Prescreption ||
  mongoose.model("Prescreption", prescreptionSchema);
