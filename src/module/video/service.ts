import type { Express } from "express";
import {
  fileProcessing,
  type ProcessedFile,
} from "../fileProcessing/fileProcessing.js";
import type { VideoRepository } from "./repository.js";
import type { IVideo } from "./video.model.js";

export class VideoService {
  constructor(private readonly videoRepository: VideoRepository) {}

  async createPendingFromUpload(file: Express.Multer.File, title: string) {
    return this.videoRepository.create({
      title,
      filename: file.filename,
      filePath: file.path,
      mimeType: file.mimetype,
      size: file.size,
      thumbnail: "",
    });
  }

  async processQueuedVideo(videoId: string) {
    const video = await this.videoRepository.findById(videoId);
    if (!video) {
      console.warn(`Video job: document not found (${videoId})`);
      return;
    }
    if (video.status !== "pending") {
      console.warn(`Video job: skip ${videoId}, status is ${video.status}`);
      return;
    }

    await this.updateStatus(videoId, "processing");
    try {
      const processed = await this.fileProcess(
        video.filePath,
        video.filename,
        video.mimeType,
      );
      const result = await this.videoRepository.updateAfterProcessing(videoId, {
        filename: processed.filename,
        filePath: processed.filePath,
        mimeType: processed.mimeType,
        size: processed.size,
        thumbnail: processed.thumbnail ?? "",
        status: "done",
      });
      return result;
    } catch (err) {
      console.error(`Video job failed (${videoId}):`, err);
      await this.updateStatus(videoId, "failed");
    }
  }

  async uploadVideo(file: ProcessedFile, title: string) {
    return this.videoRepository.create({
      title,
      filename: file.filename,
      filePath: file.filePath,
      mimeType: file.mimeType,
      size: file.size,
      thumbnail: file.thumbnail ?? "",
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
