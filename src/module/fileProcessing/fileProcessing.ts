import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";
import { helperClass } from "../../utils/utils.js";
import {
  COMPRESSED_IMAGE_FORMAT,
  COMPRESSED_VIDEO_FORMAT,
  directories,
} from "../../types/constant.js";
import { mimeTypes } from "../../types/mime.types.js";

export interface ProcessedFile {
  filename: string;
  filePath: string;
  size: number;
  mimeType: string;
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

  private async fileProcess(
    inputPath: string,
    fileName: string,
    mimeType: string,
  ): Promise<ProcessedFile> {
    const originalName = fileName.split(".")[0];

    console.log("Processing file");
    console.log("Reading file from: ", inputPath);
    return new Promise((resolve, reject) => {
      let ffmpeg;
      let outputFile: string;
      if (mimeType.startsWith("image")) {
        outputFile = `${directories.IMAGE_UPLOAD}/${originalName}.${COMPRESSED_IMAGE_FORMAT}`;
        console.log("Writing file to: ", outputFile);

        ffmpeg = this.imageChild(inputPath, outputFile);
      } else {
        outputFile = `${directories.VIDEO_UPLOAD}/${originalName}.${COMPRESSED_VIDEO_FORMAT}`;
        console.log("Writing file to: ", outputFile);

        ffmpeg = this.videoChild(inputPath, outputFile);
      }
      ffmpeg.on("close", async (code) => {
        if (code === 0) {
          await helperClass.DeleteFile(inputPath);
          const size = (await fs.stat(outputFile)).size;
          resolve({
            filename: path.basename(outputFile),
            filePath: outputFile,
            size,
            mimeType: mimeTypes[`${COMPRESSED_IMAGE_FORMAT}`] || "image/webp",
          });
        } else reject(new Error("Failed to process file"));
      });

      ffmpeg.on("error", reject);
    });
  }

  imageChild(inputPath: string, outputFile: string) {
    return spawn("ffmpeg", [
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
}
export const fileProcessing = new FileProcessing();
