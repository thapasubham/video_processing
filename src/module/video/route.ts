import { Router } from "express";
import multer from "multer";
import path from "path";
import { VideoController } from "./controller.js";
import { VideoService } from "./service.js";
import { VideoRepository } from "./repository.js";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype.startsWith("video/") ||
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"));
    }
  },
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
});

const route = Router();
const videoRepository = new VideoRepository();
const videoService = new VideoService(videoRepository);
const videoController = new VideoController(videoService);

route.post("/", upload.single("video"), videoController.uploadVideo);
route.get("/", videoController.getAllVideos);
route.get("/:id", videoController.getVideoById);

export const router = route;
