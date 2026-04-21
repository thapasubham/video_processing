import type { Request, Response } from "express";
import type { VideoService } from "./service.js";
import { publishVideoProcessJob } from "../../external/rabbitmq/producer.js";

export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  uploadVideo = async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      const title = (req.body as { title?: string }).title ?? file.originalname;
      const video = await this.videoService.createPendingFromUpload(
        file,
        title,
      );
      const videoId = String(video._id);
      const enqueued = await publishVideoProcessJob(videoId);
      if (!enqueued) {
        await this.videoService.updateStatus(videoId, "failed");
        res.status(503).json({
          error: "Could not enqueue processing job",
          video,
        });
        return;
      }

      res.status(202).json({
        message: "Upload accepted; processing in background",
        video,
      });
    } catch (err) {
      if (err instanceof Error) {
        res.status(415)
          .json({
            error: "Error occured when File Upload",
            message: err.message,
          });
      }
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
}
