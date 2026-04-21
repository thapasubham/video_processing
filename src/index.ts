import express from "express";
import type { Request, Response } from "express";
import { router } from "./module/video/route.js";
import { connectMongoDB } from "./external/database/mongoDB.client.js";
import { helperClass } from "./utils/utils.js";
import { rabbitMQ } from "./external/rabbitmq/rabbitmq.client.js";
import { registerQueue } from "./external/rabbitmq/registerQueues.js";
import { config } from "./utils/config.js";
import { errorHandler } from "./middleware/errorHandler.js";

async function startServer() {
  await connectMongoDB();

  const app = express();
  const port = 5000;

  app.use(express.json());

  await rabbitMQ.connect();
  await registerQueue(config.VIDEO_PROCESS_QUEUE);
  await helperClass.createDirectories();
  app.get("/", (req: Request, res: Response) => {
    return res.send("Hello");
  });

  app.use("/video", router);

  app.use("", (req: Request, res: Response) => {
    res.status(404).send("Route doesn't exists");
  });

  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`Listening at port: ${port}`);
  });
  process.on("SIGINT", () => {
    console.log("Exiting program");
    process.exit(1);
  });
  process.on("SIGTERM", () => {
    console.log("Exiting program");
    process.exit(1);
  });
}

startServer();
