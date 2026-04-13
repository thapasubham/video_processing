import fs from "fs/promises";
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
}

export const helperClass = new HelperClass();
