import mongoose from 'mongoose';

let cachedPromise = null;

export const connectDB = async () => {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return { type: 'mongodb', host: mongoose.connection.host };
  }

  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim()) {
    if (!cachedPromise) {
      cachedPromise = mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      }).then((conn) => {
        console.log(`[MongoDB Connected]: ${conn.connection.host}`);
        return { type: 'mongodb', host: conn.connection.host };
      }).catch((err) => {
        cachedPromise = null;
        console.warn(`[MongoDB Warning]: Could not connect to MONGODB_URI (${err.message}). Falling back.`);
        return { type: 'json-fallback', error: err.message };
      });
    }
    return cachedPromise;
  } else {
    console.log('[Database Notice]: No MONGODB_URI specified. Operating with persistent JSON store.');
    return { type: 'json-fallback' };
  }
};

export default connectDB;
