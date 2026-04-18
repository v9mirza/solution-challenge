import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/api.routes.js";
import { errorMiddleware } from "./middleware/error.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
  app.use(express.json());

  app.use("/api", apiRouter);

  app.use(errorMiddleware);

  return app;
}
