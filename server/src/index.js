import "dotenv/config";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";

const port = Number(process.env.PORT) || 5000;
const app = createApp();

await connectDatabase().catch((err) => {
  console.warn("MongoDB:", err.message);
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
