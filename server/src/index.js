import "dotenv/config";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";

const port = Number(process.env.PORT) || 5000;
const app = createApp();

await connectDatabase().catch((err) => {
  console.warn("MongoDB:", err.message);
});

const server = app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

server.on("error", (err) => {
  if (err?.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Stop the other process or run with a different port, e.g. PORT=${port + 1} npm run dev`
    );
    process.exit(1);
  }
  console.error("Server failed to start:", err.message);
  process.exit(1);
});
