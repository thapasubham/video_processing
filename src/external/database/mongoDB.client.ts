import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ??
  "mongodb://root:example@localhost:27021/video_procssing";

export async function connectMongoDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
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
