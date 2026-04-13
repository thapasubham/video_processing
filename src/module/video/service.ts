import { helperClass } from "../../utils/utils.js";
import type { VideoRepository } from "./repository.js";
import type { IVideo } from "./video.model.js";
import { spawn } from "child_process";

export class VideoService {
  constructor(private readonly videoRepository: VideoRepository) {}

  async uploadVideo(file: Express.Multer.File, title: string) {
    return this.videoRepository.create({
      title: title || file.filename,
      filename: file.filename,
      filePath: file.path,
      mimeType: file.mimetype,
      size: file.size,
    });
  }

  async fileProcess(
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
        "-q:v",
        "2",
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
  async getAllVideos() {
    return this.videoRepository.findAll();
  }

  async getVideoById(id: string) {
    return this.videoRepository.findById(id);
  }

  async updateStatus(id: string, status: IVideo["status"]) {
    return this.videoRepository.updateStatus(id, status);
  }
}
