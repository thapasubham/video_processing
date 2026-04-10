import type { Request, Response } from "express";
import type { VideoService } from "../service/service.js";

export class VideoController {
  constructor(private readonly videoService: VideoService) {}
  getStatus = async (req: Request, res: Response) => {
    const result = await this.videoService.getVideo();
    res.send(`<h1 style="color: red;">${result}</h1>`);
  };

  uploadVideo = async (req: Request, res: Response) => {
    res.send("<h1>Video uploaded</h1>");
  };
}
