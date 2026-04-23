import { ImageModel, type IImage } from "./image.model.js";

export class ImageRepository {
  async create(data: Omit<IImage, "status">) {
    return ImageModel.create(data);
  }

  async findById(id: string) {
    return ImageModel.findById(id);
  }

  async findAll() {
    return ImageModel.find().sort({ createdAt: -1 });
  }

  async updateStatus(id: string, status: IImage["status"]) {
    return ImageModel.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );
  }

  async updateAfterProcessing(
    id: string,
    data: Pick<IImage, "filename" | "filePath" | "mimeType" | "size" | "status">,
  ) {
    return ImageModel.findByIdAndUpdate(id, data, { returnDocument: "after" });
  }
}
