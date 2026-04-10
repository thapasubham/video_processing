import express from "express";
import type { Request, Response } from "express";
import { router } from "./route/route.js";

function startServer() {
  const app = express();
  const port = 5000;

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
