import {
  fileProcessing,
  type ProcessedFile,
} from "../fileProcessing/fileProcessing.js";
import type { VideoRepository } from "./repository.js";
import type { IVideo } from "./video.model.js";

export class VideoService {
  constructor(private readonly videoRepository: VideoRepository) {}

  async uploadVideo(file: ProcessedFile, title: string) {
    return this.videoRepository.create({
      title,
      filename: file.filename,
      filePath: file.filePath,
      mimeType: file.mimeType,
      size: file.size,
    });
  }

  async fileProcess(
    inputPath: string,
    fileName: string,
    mineType: string,
  ): Promise<ProcessedFile> {
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
