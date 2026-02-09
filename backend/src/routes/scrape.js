import express from "express";
import { safeToScrape } from "../services/compliance.js";
import { scrapeJobPosting } from "../services/scraper.js";
import { query } from "../services/database.js";

export const scrapeRouter = express.Router();

scrapeRouter.post("/", async (req, res) => {
  const { url } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const allowList = (process.env.ALLOW_LIST || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  const denyList = (process.env.DENY_LIST || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  try {
    const compliance = await safeToScrape(url, { allowList, denyList });

    if (!compliance.allowed) {
      return res.status(403).json({ error: "Scrape blocked", compliance });
    }

    const data = await scrapeJobPosting(url);

    const result = await query(
      "INSERT INTO job_postings (job_title, company, description, source_url, extracted_emails, compliance_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        data.jobTitle,
        data.company,
        data.description,
        url,
        data.extractedEmails,
        compliance
      ]
    );

    return res.json({ job: result.rows[0], compliance });
  } catch (error) {
    return res.status(500).json({ error: "Scrape failed" });
  }
});
