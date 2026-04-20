import { rabbitMQ } from "./rabbitmq.client.js";
import { config } from "../../utils/config.js";

export type VideoProcessMessage = { videoId: string };

export async function publishVideoProcessJob(
  videoId: string,
): Promise<boolean> {
  return producer<VideoProcessMessage>(config.VIDEO_PROCESS_QUEUE, {
    videoId,
  });
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
