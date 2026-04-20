export const config = {
  RABBITMQ_URL: process.env.RABBITMQ_URL || "amqp://localhost:5672",
  MONGODB_URI:
    process.env.MONGODB_URI ??
    "mongodb://root:example@localhost:27021/video_procssing",
  VIDEO_PROCESS_QUEUE:
    process.env.VIDEO_PROCESS_QUEUE ?? "video.process",
};
