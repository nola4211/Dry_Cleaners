import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { searchRouter } from "./routes/search.js";
import { scrapeRouter } from "./routes/scrape.js";
import { outreachRouter } from "./routes/outreach.js";
import { jobsRouter } from "./routes/jobs.js";
import { initializeDatabase } from "./services/database.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/search", searchRouter);
app.use("/api/scrape", scrapeRouter);
app.use("/api/outreach", outreachRouter);
app.use("/api/jobs", jobsRouter);

const port = process.env.PORT || 4000;

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });
