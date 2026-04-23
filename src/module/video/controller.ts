import type { Express, Request, Response } from "express";
import type { VideoService } from "./service.js";
import type { ImageService } from "./image.service.js";
import { publishMediaProcessJob } from "../../external/rabbitmq/producer.js";

function getUploadedFile(req: Request): Express.Multer.File | undefined {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  if (files) {
    return files.file?.[0] ?? files.video?.[0];
  }
  return req.file ?? undefined;
}

export class MediaController {
  constructor(
    private readonly videoService: VideoService,
    private readonly imageService: ImageService,
  ) {}

  uploadMedia = async (req: Request, res: Response) => {
    try {
      const file = getUploadedFile(req);
      if (!file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      const title = (req.body as { title?: string }).title ?? file.originalname;
      const isImage = file.mimetype.startsWith("image/");

      if (isImage) {
        const image = await this.imageService.createPendingFromUpload(
          file,
          title,
        );
        const mediaId = String(image._id);
        const enqueued = await publishMediaProcessJob({
          mediaId,
          kind: "image",
        });
        if (!enqueued) {
          await this.imageService.updateStatus(mediaId, "failed");
          res.status(503).json({
            error: "Could not enqueue processing job",
            image,
          });
          return;
        }
        res.status(202).json({
          message: "Upload accepted; processing in background",
          kind: "image",
          image,
        });
        return;
      }

      const video = await this.videoService.createPendingFromUpload(
        file,
        title,
      );
      const mediaId = String(video._id);
      const enqueued = await publishMediaProcessJob({
        mediaId,
        kind: "video",
      });
      if (!enqueued) {
        await this.videoService.updateStatus(mediaId, "failed");
        res.status(503).json({
          error: "Could not enqueue processing job",
          video,
        });
        return;
      }

      res.status(202).json({
        message: "Upload accepted; processing in background",
        kind: "video",
        video,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      res.status(500).json({
        error: "Error occurred while uploading",
        message,
      });
    }
  };

  getAllVideos = async (req: Request, res: Response) => {
    const videos = await this.videoService.getAllVideos();
    res.json({ videos });
  };

  getVideoById = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (id == undefined) {
      return res.status(400).json({ error: "Id missing" });
    }
    const video = await this.videoService.getVideoById(req.params.id as string);
    if (!video) {
      res.status(404).json({ error: "Video not found" });
      return;
    }
    res.json({ video });
  };

  getAllImages = async (_req: Request, res: Response) => {
    const images = await this.imageService.getAllImages();
    res.json({ images });
  };

  getImageById = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (id == undefined) {
      return res.status(400).json({ error: "Id missing" });
    }
    const image = await this.imageService.getImageById(req.params.id as string);
    if (!image) {
      res.status(404).json({ error: "Image not found" });
      return;
    }
    res.json({ image });
  };
}
