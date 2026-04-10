import { Router } from "express";
import { VideoController } from "../controller/controller.js";
import { VideoService } from "../service/service.js";

const route = Router();
const videoService = new VideoService();
const videoController = new VideoController(videoService);
route.get("/", videoController.getStatus);
route.post("/", videoController.uploadVideo);

export const router = route;
