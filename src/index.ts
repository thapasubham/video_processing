import express from "express";
import type { Request, Response } from "express";
import { router } from "./module/video/route.js";
import { connectMongoDB } from "./external/database/mongoDB.client.js";
import { helperClass } from "./utils/utils.js";

async function startServer() {
  await connectMongoDB();

  const app = express();
  const port = 5000;

  app.use(express.json());
  await helperClass.createDirectories();
  app.get("/", (req: Request, res: Response) => {
    return res.send("Hello");
  });

  app.use("/video", router);

  app.use("", (req: Request, res: Response) => {
    res.status(404).send("Route doesn't exists");
  });

  app.listen(port, () => {
    console.log(`Listening at port: ${port}`);
  });
}

startServer();
