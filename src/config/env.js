import dotenv from "dotenv";

// Load environment variables immediately
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
