import type { ConsumeMessage } from "amqplib";
import { rabbitMQ } from "./rabbitmq.client.js";
import { registerQueue } from "./registerQueues.js";
import { config } from "../../utils/config.js";
import type { VideoProcessMessage } from "./producer.js";
import { VideoService } from "../../module/video/service.js";
import { VideoRepository } from "../../module/video/repository.js";

export async function startVideoConsumer(): Promise<void> {
  const channel = rabbitMQ.getChannel();
  await registerQueue(config.VIDEO_PROCESS_QUEUE);

  const videoService = new VideoService(new VideoRepository());

  await channel.prefetch(1);

  await channel.consume(
    config.VIDEO_PROCESS_QUEUE,
    async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      let payload: VideoProcessMessage;
      try {
        payload = JSON.parse(msg.content.toString()) as VideoProcessMessage;
      } catch {
        console.error("Invalid message body, dropping");
        channel.nack(msg, false, false);
        return;
      }

      if (!payload?.videoId) {
        channel.nack(msg, false, false);
        return;
      }

      try {
        await videoService.processQueuedVideo(payload.videoId);
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
