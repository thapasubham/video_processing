import type { VideoRepository } from "./repository.js";
import type { IVideo } from "./video.model.js";

export class VideoService {
  constructor(private readonly videoRepository: VideoRepository) {}

  async uploadVideo(file: Express.Multer.File, title: string) {
    return this.videoRepository.create({
      title: title || file.originalname,
      originalName: file.originalname,
      filename: file.filename,
      filePath: file.path,
      mimeType: file.mimetype,
      size: file.size,
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
