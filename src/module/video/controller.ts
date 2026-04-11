import type { Request, Response } from "express";
import type { VideoService } from "./service.js";

export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  uploadVideo = async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    const title = (req.body as { title?: string }).title ?? file.originalname;
    const video = await this.videoService.uploadVideo(file, title);
    res.status(201).json({ message: "Video uploaded", video });
  };

  getAllVideos = async (req: Request, res: Response) => {
    const videos = await this.videoService.getAllVideos();
    res.json({ videos });
  };

  getVideoById = async (req: Request, res: Response) => {
    const id = req.params.id;
    if (id == null) {
      return res.send(400).json({ error: "Id missing" });
    }
    const video = await this.videoService.getVideoById(req.params.id);
    if (!video) {
      res.status(404).json({ error: "Video not found" });
      return;
    }
    res.json({ video });
  };
}
