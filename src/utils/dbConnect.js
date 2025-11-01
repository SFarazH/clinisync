import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ quiet: true });
const DB_URL = process.env.DB_URL;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(DB_URL)
      .then((mongooseInstance) => {
        console.log("Database connected successfully");
        return mongooseInstance;
      })
      .catch((error) => {
        console.error("Failed to connect to DB:", error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export { dbConnect };
