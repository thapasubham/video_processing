import type { Express } from "express";
import {
  fileProcessing,
  type ProcessedFile,
} from "../fileProcessing/fileProcessing.js";
import type { ImageRepository } from "./image.repository.js";
import type { IImage } from "./image.model.js";

export class ImageService {
  constructor(private readonly imageRepository: ImageRepository) {}

  async createPendingFromUpload(file: Express.Multer.File, title: string) {
    return this.imageRepository.create({
      title,
      filename: file.filename,
      filePath: file.path,
      mimeType: file.mimetype,
      size: file.size,
    });
  }

  async processQueuedImage(imageId: string) {
    const image = await this.imageRepository.findById(imageId);
    if (!image) {
      console.warn(`Image job: document not found (${imageId})`);
      return;
    }
    if (image.status !== "pending") {
      console.warn(`Image job: skip ${imageId}, status is ${image.status}`);
      return;
    }

    await this.updateStatus(imageId, "processing");
    try {
      const processed = await fileProcessing.processFile(
        image.filePath,
        image.filename,
        image.mimeType,
      );
      await this.imageRepository.updateAfterProcessing(imageId, {
        filename: processed.filename,
        filePath: processed.filePath,
        mimeType: processed.mimeType,
        size: processed.size,
        status: "done",
      });
    } catch (err) {
      console.error(`Image job failed (${imageId}):`, err);
      await this.updateStatus(imageId, "failed");
    }
  }

  async uploadImage(file: ProcessedFile, title: string) {
    return this.imageRepository.create({
      title,
      filename: file.filename,
      filePath: file.filePath,
      mimeType: file.mimeType,
      size: file.size,
    });
  }

  async getAllImages() {
    return this.imageRepository.findAll();
  }

  async getImageById(id: string) {
    return this.imageRepository.findById(id);
  }

  async updateStatus(id: string, status: IImage["status"]) {
    return this.imageRepository.updateStatus(id, status);
  }
}
