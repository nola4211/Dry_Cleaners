import express from "express";
import { searchJobs } from "../services/search.js";

export const searchRouter = express.Router();

searchRouter.post("/", async (req, res) => {
  const { jobTitle, skills = [], location, keywords = [] } = req.body || {};

  try {
    const urls = await searchJobs({ jobTitle, skills, location, keywords });
    res.json({ urls });
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
});
