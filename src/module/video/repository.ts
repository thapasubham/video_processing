import { VideoModel, type IVideo } from "./video.model.js";

export class VideoRepository {
  async create(data: Omit<IVideo, "status" | "uploadedAt">) {
    return VideoModel.create(data);
  }

  async findById(id: string) {
    return VideoModel.findById(id);
  }

  async findAll() {
    return VideoModel.find().sort({ uploadedAt: -1 });
  }

  async updateStatus(id: string, status: IVideo["status"]) {
    return VideoModel.findByIdAndUpdate(id, { status }, { new: true });
  }
}
