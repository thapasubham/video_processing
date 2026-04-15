import fs from "fs/promises";
import file from "fs";
import { directories } from "../types/constant.js";
import { dir } from "console";
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
        if (file.existsSync(value)) {
          console.log(`${value} already exists`);
          return;
        }
        await fs.mkdir(value, { recursive: true });
        console.log(`${value} created`);
      });
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      }
      console.log("Exiting program...");
      process.exit();
    }
  }
}

export const helperClass = new HelperClass();
