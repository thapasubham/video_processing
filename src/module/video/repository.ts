import { VideoModel, type IVideo } from "./video.model.js";

export class VideoRepository {
  async create(data: Omit<IVideo, "status">) {
    return VideoModel.create(data);
  }

  async findById(id: string) {
    return VideoModel.findById(id);
  }

  async findAll() {
    return VideoModel.find().sort({ createdAt: -1 });
  }

  async updateStatus(id: string, status: IVideo["status"]) {
    return VideoModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true },
    );
  }

  async updateAfterProcessing(
    id: string,
    data: Pick<
      IVideo,
      "filename" | "filePath" | "mimeType" | "size" | "status" | "thumbnail"
    >,
  ) {
    return VideoModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    );
  }
}
