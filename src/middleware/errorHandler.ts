import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import { UploadRejectedError } from "./fileUpload.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        error: "File too large",
        message: err.message,
      });
      return;
    }
    res.status(400).json({
      error: "Upload error",
      message: err.message,
    });
    return;
  }

  if (err instanceof UploadRejectedError) {
    res.status(400).json({
      error: "Upload rejected",
      message: err.message,
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: "Internal server error",
    message: err instanceof Error ? err.message : "Something went wrong",
  });
}
