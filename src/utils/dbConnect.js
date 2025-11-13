import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ quiet: true });
const DB_URL = process.env.DB_URL;

const connections = global.connections || new Map();
global.connections = connections;

async function getDatabaseConnection(dbName) {
  if (!dbName) throw new Error("Database name is required.");

  if (connections.has(dbName)) {
    return connections.get(dbName);
  }

  const fullUri = `${DB_URL}/${dbName}`;
  const conn = await mongoose.createConnection(fullUri).asPromise();

  console.log(`✅ Connected to database: ${dbName}`);

  connections.set(dbName, conn);
  return conn;
}

export async function getMongooseModel(dbName, modelName, schema) {
  const conn = await getDatabaseConnection(dbName);
  return conn.models[modelName] || conn.model(modelName, schema);
}
