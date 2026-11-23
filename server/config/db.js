import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim()) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[MongoDB Connected]: ${conn.connection.host}`);
      return { type: 'mongodb', host: conn.connection.host };
    } catch (err) {
      console.warn(`[MongoDB Warning]: Could not connect to MONGODB_URI (${err.message}). Using local JSON persistent store fallback.`);
      return { type: 'json-fallback', error: err.message };
    }
  } else {
    console.log('[Database Notice]: No MONGODB_URI specified. Operating with persistent JSON store (Free-Tier Architecture). Ready to connect to MongoDB Atlas when MONGODB_URI is provided in .env.');
    return { type: 'json-fallback' };
  }
};

export default connectDB;
