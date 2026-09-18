// Mongo connection helper used on server startup and seed/simulate scripts.
import path from "node:path";
import mongoose from "mongoose";

/** Default DB for the API and CLI scripts. Integration tests use `webapi_test` in test/api.test.js instead. */
export const getAppDatabaseName = () => process.env.MONGO_DB_NAME || "webapi_prod";

const isLocalDevelopment = () => !process.env.NODE_ENV || process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

const getMemoryServerDownloadDir = () => {
  if (process.env.MONGOMS_DOWNLOAD_DIR) {
    return process.env.MONGOMS_DOWNLOAD_DIR;
  }

  const fallbackDir = path.resolve(process.cwd(), ".mongodb-binaries");
  process.env.MONGOMS_DOWNLOAD_DIR = fallbackDir;
  return fallbackDir;
};

const connectWithInMemoryMongo = async (dbName) => {
  const { MongoMemoryServer } = await import("mongodb-memory-server");
  const downloadDir = getMemoryServerDownloadDir();
  const memoryServer = await MongoMemoryServer.create({
    binary: {
      version: process.env.MONGOMS_VERSION || "7.0.14",
      downloadDir
    }
  });

  const memoryUri = memoryServer.getUri();
  await mongoose.connect(memoryUri, { dbName });
  console.log(`MongoDB connected — database "${dbName}" using local in-memory fallback`);
};

/** Connect Mongoose to the app database. Falls back to an in-memory MongoDB instance in local dev when the configured Atlas URI fails. */
export const connectAppMongoose = async () => {
  const dbName = getAppDatabaseName();

  if (!process.env.MONGO_URI) {
    if (!isLocalDevelopment()) {
      throw new Error("Missing required environment variable: MONGO_URI");
    }

    await connectWithInMemoryMongo(dbName);
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName });
    console.log(`MongoDB connected — database "${dbName}"`);
  } catch (error) {
    if (!isLocalDevelopment()) {
      throw error;
    }

    console.warn(`MongoDB connection failed (${error.message}); using in-memory fallback for local development.`);
    await connectWithInMemoryMongo(dbName);
  }
};

export default connectAppMongoose;
