import multer from "multer";
import path from "path";

export class UploadRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadRejectedError";
  }
}
const storage = multer.diskStorage({
  destination: "uploads/temp",
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
      cb(new UploadRejectedError("Only image and video files are allowed"));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

export default upload;
