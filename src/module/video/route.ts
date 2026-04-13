import { Router } from "express";
import { VideoController } from "./controller.js";
import { VideoService } from "./service.js";
import { VideoRepository } from "./repository.js";
import upload from "../../middleware/fileUpload.js";

const route = Router();
const videoRepository = new VideoRepository();
const videoService = new VideoService(videoRepository);
const videoController = new VideoController(videoService);

route.post("/", upload.single("video"), videoController.uploadVideo);
route.get("/", videoController.getAllVideos);
route.get("/:id", videoController.getVideoById);

export const router = route;
