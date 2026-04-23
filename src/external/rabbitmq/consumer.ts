import type { ConsumeMessage } from "amqplib";
import { rabbitMQ } from "./rabbitmq.client.js";
import { registerQueue } from "./registerQueues.js";
import { config } from "../../utils/config.js";
import type { MediaProcessMessage } from "./producer.js";
import { VideoService } from "../../module/video/service.js";
import { VideoRepository } from "../../module/video/repository.js";
import { ImageService } from "../../module/video/image.service.js";
import { ImageRepository } from "../../module/video/image.repository.js";

function parseProcessPayload(
  raw: unknown,
): { mediaId: string; kind: "image" | "video" } | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.videoId === "string" && o.videoId.length > 0) {
    return { mediaId: o.videoId, kind: "video" };
  }
  if (
    typeof o.mediaId === "string" &&
    o.mediaId.length > 0 &&
    (o.kind === "image" || o.kind === "video")
  ) {
    return { mediaId: o.mediaId, kind: o.kind };
  }
  return null;
}

export async function startVideoConsumer(): Promise<void> {
  const channel = rabbitMQ.getChannel();
  await registerQueue(config.VIDEO_PROCESS_QUEUE);

  const videoService = new VideoService(new VideoRepository());
  const imageService = new ImageService(new ImageRepository());

  await channel.prefetch(1);

  await channel.consume(
    config.VIDEO_PROCESS_QUEUE,
    async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      let payload: MediaProcessMessage | { videoId: string };
      try {
        payload = JSON.parse(msg.content.toString()) as
          | MediaProcessMessage
          | { videoId: string };
      } catch {
        console.error("Invalid message body, dropping");
        channel.nack(msg, false, false);
        return;
      }

      const parsed = parseProcessPayload(payload);
      if (!parsed) {
        channel.nack(msg, false, false);
        return;
      }

      try {
        if (parsed.kind === "image") {
          await imageService.processQueuedImage(parsed.mediaId);
        } else {
          await videoService.processQueuedVideo(parsed.mediaId);
        }
        channel.ack(msg);
      } catch (err) {
        console.error("Unhandled consumer error:", err);
        channel.nack(msg, false, false);
      }
    },
    { noAck: false },
  );

  console.log(`Consuming queue: ${config.VIDEO_PROCESS_QUEUE}`);
}
