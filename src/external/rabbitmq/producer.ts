import { rabbitMQ } from "./rabbitmq.client.js";
import { config } from "../../utils/config.js";

/** New messages; worker also accepts legacy `{ videoId }`. */
export type MediaProcessMessage = {
  mediaId: string;
  kind: "image" | "video";
};

export type LegacyVideoProcessMessage = { videoId: string };

export async function publishMediaProcessJob(
  message: MediaProcessMessage,
): Promise<boolean> {
  return producer(config.VIDEO_PROCESS_QUEUE, message);
}

/** @deprecated Prefer publishMediaProcessJob with explicit kind */
export async function publishVideoProcessJob(
  videoId: string,
): Promise<boolean> {
  return publishMediaProcessJob({ mediaId: videoId, kind: "video" });
}

export async function producer<T>(
  queueName: string,
  message: T,
): Promise<boolean> {
  try {
    const channel = rabbitMQ.getChannel();
    const published = channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(message)),
      { persistent: true },
    );
    return published;
  } catch (e) {
    if (e instanceof Error) {
      console.log("Failed to produce message");
      console.log(e.message);
    }
    return false;
  }
}
