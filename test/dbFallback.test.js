import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import connectAppMongoose from "../src/config/db.js";

test("connectAppMongoose falls back to in-memory Mongo for local dev when the Atlas URI is invalid", async () => {
  const previousUri = process.env.MONGO_URI;
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDbName = process.env.MONGO_DB_NAME;

  process.env.NODE_ENV = "development";
  process.env.MONGO_URI = "mongodb+srv://bad:bad@invalid-cluster.mongodb.net/?appName=dev";
  process.env.MONGO_DB_NAME = "fallback_local_dev";

  try {
    await mongoose.disconnect().catch(() => {});
    await connectAppMongoose();

    assert.equal(mongoose.connection.readyState, 1);
    assert.equal(mongoose.connection.name, "fallback_local_dev");
  } finally {
    process.env.MONGO_URI = previousUri;
    process.env.NODE_ENV = previousNodeEnv;
    process.env.MONGO_DB_NAME = previousDbName;
    await mongoose.disconnect().catch(() => {});
  }
});
