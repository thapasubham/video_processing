import { VideoModel, type IVideo } from "./video.model.js";

export class VideoRepository {
  async create(data: Omit<IVideo, "status">) {
    return VideoModel.create(data);
  }

  async findById(id: string) {
    return VideoModel.findById(id);
  }

  async findAll() {
    return VideoModel.find().sort({ uploadedAt: -1 });
  }

  async updateStatus(id: string, status: IVideo["status"]) {
    return VideoModel.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );
  }

  async updateAfterProcessing(
    id: string,
    data: Pick<
      IVideo,
      "filename" | "filePath" | "mimeType" | "size" | "status"
    >,
  ) {
    return VideoModel.findByIdAndUpdate(id, data, { returnDocument: "after" });
  }
}
