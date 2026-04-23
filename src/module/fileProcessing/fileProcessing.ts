import { spawn, type ChildProcessWithoutNullStreams } from "child_process";
import path from "path";
import fs from "fs/promises";
import { helperClass } from "../../utils/utils.js";
import {
  COMPRESSED_IMAGE_FORMAT,
  COMPRESSED_VIDEO_FORMAT,
  directories,
} from "../../types/constant.js";
import { mimeTypes } from "../../types/mime.types.js";

const VIDEO_THUMB_EXT = ".jpg";

export interface ProcessedFile {
  filename: string;
  filePath: string;
  size: number;
  mimeType: string;
  /** Set for video output; path lives under uploads/processed/thumbnail */
  thumbnail?: string;
}

class FileProcessing {
  async processFile(
    inputPath: string,
    fileName: string,
    mimeType: string,
  ): Promise<ProcessedFile> {
    const allowedType = Object.values(mimeTypes).some((val) =>
      mimeType.includes(val),
    );
    if (!allowedType) {
      throw new Error("THis file format isnt allowed");
    }

    return await this.fileProcess(inputPath, fileName, mimeType);
  }

  private runFfmpeg(child: ChildProcessWithoutNullStreams): Promise<void> {
    return new Promise((resolve, reject) => {
      child.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error("Failed to process file"));
      });
      child.on("error", reject);
    });
  }

  private async fileProcess(
    inputPath: string,
    fileName: string,
    mimeType: string,
  ): Promise<ProcessedFile> {
    const originalName = fileName.split(".")[0];

    console.log("Processing file");
    console.log("Reading file from: ", inputPath);

    const lowerMime = mimeType.toLowerCase();
    if (lowerMime.startsWith("image/")) {
      const outputFile = `${directories.IMAGE_UPLOAD}/${originalName}${COMPRESSED_IMAGE_FORMAT}`;
      console.log("Writing file to: ", outputFile);
      await this.runFfmpeg(this.imageChild(inputPath, outputFile));
      await helperClass.DeleteFile(inputPath);
      const size = (await fs.stat(outputFile)).size;
      return {
        filename: path.basename(outputFile),
        filePath: outputFile,
        size,
        mimeType: mimeTypes[COMPRESSED_IMAGE_FORMAT] ?? "image/webp",
      };
    }

    const outputFile = `${directories.VIDEO_UPLOAD}/${originalName}${COMPRESSED_VIDEO_FORMAT}`;
    const thumbnailFile = `${directories.THUMBNAIL_UPLOAD}/${originalName}${VIDEO_THUMB_EXT}`;
    console.log("Writing file to: ", outputFile);
    await this.runFfmpeg(this.videoChild(inputPath, outputFile));
    await fs.mkdir(directories.THUMBNAIL_UPLOAD, { recursive: true });
    console.log("Writing thumbnail to: ", thumbnailFile);
    await this.runFfmpeg(this.thumbnailChild(outputFile, thumbnailFile));
    await helperClass.DeleteFile(inputPath);
    const size = (await fs.stat(outputFile)).size;
    return {
      filename: path.basename(outputFile),
      filePath: outputFile,
      size,
      mimeType: mimeTypes[COMPRESSED_VIDEO_FORMAT] ?? "video/mp4",
      thumbnail: thumbnailFile,
    };
  }

  imageChild(inputPath: string, outputFile: string) {
    return spawn("ffmpeg", [
      "-y",
      "-i",
      inputPath,
      "-vcodec",
      "libwebp",
      "-q:v",
      "40",
      "-compression_level",
      "6",
      "-vf",
      "scale=iw*0.5:ih*0.5",
      outputFile,
    ]);
  }
  videoChild(inputPath: string, outputFile: string) {
    return spawn("ffmpeg", [
      "-y",
      "-i",
      inputPath,
      "-vcodec",
      "libx264",
      "-crf",
      "23",
      "-preset",
      "medium",
      outputFile,
    ]);
  }
  thumbnailChild(inputPath: string, outputFile: string) {
    return spawn("ffmpeg", [
      "-y",
      "-i",
      inputPath,
      "-vf",
      "thumbnail=300,scale=320:-1",
      "-frames:v",
      "1",
      "-q:v",
      "2",
      outputFile,
    ]);
  }
}
export const fileProcessing = new FileProcessing();
