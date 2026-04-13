import multer from "multer";
import path from "path";
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
      cb(new Error("Only video files are allowed"));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

export default upload;
