import { Schema, model } from "mongoose";

export interface IVideo {
  title: string;
  originalName: string;
  filename: string;
  filePath: string;
  mimeType: string;
  size: number;
  status: "pending" | "processing" | "done" | "failed";
  uploadedAt: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true },
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const VideoModel = model<IVideo>("Video", videoSchema);
