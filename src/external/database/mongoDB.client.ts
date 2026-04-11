import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ??
  "mongodb://root:example@localhost:27020/video_procssing";

export async function connectMongoDB(): Promise<void> {
  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB connected");
}

export { mongoose };
