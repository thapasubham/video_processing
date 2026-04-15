import { helperClass } from "../../utils/utils.js";
import { fileProcessing } from "../fileProcessing/fileProcessing.js";
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

  async fileProcess(inputPath: string, fileName: string, mineType: string) {
    return await fileProcessing.processFile(inputPath, fileName, mineType);
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
