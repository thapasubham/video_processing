import fs from "fs/promises";
import { directories } from "../types/constant.js";
class HelperClass {
  async DeleteFile(filePath: string) {
    try {
      await fs.unlink(filePath);
      console.log("File deleted successfully");
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error deleting file:", err.message);
      }
    }
  }

  async createDirectories() {
    try {
      Object.values(directories).forEach(async (value) => {
        await fs.mkdir(value, { recursive: true });
        console.log(`${value} created`);
      });
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      }
      process.exit();
    }
  }
}

export const helperClass = new HelperClass();
