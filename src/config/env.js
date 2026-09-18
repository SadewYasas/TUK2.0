const requiredEnv = ["JWT_SECRET"];

if (process.env.NODE_ENV === "production") {
  requiredEnv.push("MONGO_URI");
}

export const validateRequiredEnv = () => {
  const missing = requiredEnv.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

