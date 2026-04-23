import { Router } from "express";
import { MediaController } from "./controller.js";
import { VideoService } from "./service.js";
import { VideoRepository } from "./repository.js";
import { ImageService } from "./image.service.js";
import { ImageRepository } from "./image.repository.js";
import upload from "../../middleware/fileUpload.js";

const route = Router();
const videoRepository = new VideoRepository();
const imageRepository = new ImageRepository();
const videoService = new VideoService(videoRepository);
const imageService = new ImageService(imageRepository);
const mediaController = new MediaController(videoService, imageService);

route.post(
  "/",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  mediaController.uploadMedia,
);
route.get("/images", mediaController.getAllImages);
route.get("/images/:id", mediaController.getImageById);
route.get("/", mediaController.getAllVideos);
route.get("/:id", mediaController.getVideoById);

export const router = route;
