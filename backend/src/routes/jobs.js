import express from "express";
import { query } from "../services/database.js";

export const jobsRouter = express.Router();

jobsRouter.get("/", async (req, res) => {
  try {
    const result = await query("SELECT * FROM job_postings ORDER BY created_at DESC");
    res.json({ jobs: result.rows });
  } catch (error) {
    res.status(500).json({ error: "Failed to load jobs" });
  }
});
