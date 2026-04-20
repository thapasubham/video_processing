import mongoose from "mongoose";
import { config } from "../../utils/config.js";

export async function connectMongoDB(): Promise<void> {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
      console.log("Exiting program");
      if (process.env.NODE_ENV === "production") {
        process.exit(1);
      }
    }
  }
}

export { mongoose };
