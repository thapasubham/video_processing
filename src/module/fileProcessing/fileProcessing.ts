import { spawn } from "child_process";
import { helperClass } from "../../utils/utils.js";
import { directories } from "../../types/constant.js";
import { mimeTypes } from "../../types/mime.types.js";

class FileProcessing {
  async processFile(inputPath: string, fileName: string, mimeType: string) {
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
    return "hi";
  }

  private async fileImage(
    inputPath: string,
    fileName: string,
    outputDir: string,
  ): Promise<string> {
    const originalName = fileName.split(".")[0];
    const outputFile = `${outputDir}/${originalName}.webp`;
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
          resolve(outputFile);
        } else reject(new Error(`ffmpeg exited with code ${code}`));
      });

      ffmpeg.on("error", reject);
    });
  }
}
export const fileProcessing = new FileProcessing();
