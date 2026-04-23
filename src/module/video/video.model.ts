import { Schema, model } from "mongoose";

export interface IVideo {
  title: string;
  filename: string;
  filePath: string;
  thumbnail: string;
  mimeType: string;
  size: number;
  status: "pending" | "processing" | "done" | "failed";
}

const videoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true },
    filename: { type: String, required: true },
    filePath: { type: String, required: true },
    /** Filled after processing; empty while pending */
    thumbnail: { type: String, default: "" },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "done", "failed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export const VideoModel = model<IVideo>("Video", videoSchema);
