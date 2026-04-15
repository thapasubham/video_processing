import type { Request, Response } from "express";
import type { VideoService } from "./service.js";

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
      const processed = await this.videoService.fileProcess(file.path, file.filename, file.mimetype);
      const video = await this.videoService.uploadVideo(processed, title);
      await this.videoService.updateStatus(video.id, "done");
      res.status(201).json({ message: "File uploaded", video });
    } catch (err) {
      if (err instanceof Error) {
        res
          .json({
            error: "Error occured when File Upload",
            message: err.message,
          })
          .status(415);
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
      return res.send(400).json({ error: "Id missing" });
    }
    const video = await this.videoService.getVideoById(req.params.id as string);
    if (!video) {
      res.status(404).json({ error: "Video not found" });
      return;
    }
    res.json({ video });
  };
}
