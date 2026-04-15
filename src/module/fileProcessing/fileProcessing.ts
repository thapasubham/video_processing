import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";
import { helperClass } from "../../utils/utils.js";
import { COMPRESSED_IMAGE_FORMAT, directories } from "../../types/constant.js";
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
    if (mimeType.startsWith("image")) {
      return await this.fileImage(
        inputPath,
        fileName,
        directories.IMAGE_UPLOAD,
      );
    }
    throw new Error("Unsupported file type");
  }

  private async fileImage(
    inputPath: string,
    fileName: string,
    outputDir: string,
  ): Promise<ProcessedFile> {
    const originalName = fileName.split(".")[0];
    const outputFile = `${outputDir}/${originalName}.${COMPRESSED_IMAGE_FORMAT}`;
    console.log("Processing file");
    console.log("Reading file from: ", inputPath);
    console.log("Writing file to: ", outputFile);
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
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
}
export const fileProcessing = new FileProcessing();
