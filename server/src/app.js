import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/api.routes.js";
import { errorMiddleware } from "./middleware/error.js";

export function createApp() {
  const app = express();

  const configuredOrigin = process.env.CLIENT_ORIGIN;
  const allowedOrigins = new Set(
    [
      configuredOrigin,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
      "http://localhost:4173",
      "http://127.0.0.1:4173",
    ].filter(Boolean)
  );

  app.use(
    cors({
      origin(origin, callback) {
        // Allow server-to-server tools and same-origin requests without an Origin header.
        if (!origin) return callback(null, true);
        if (allowedOrigins.has(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
    })
  );
  app.use(express.json());

  app.use("/api", apiRouter);

  app.use(errorMiddleware);

  return app;
}
