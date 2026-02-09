import express from "express";
import { query } from "../services/database.js";
import { sendEmail } from "../services/email.js";

export const outreachRouter = express.Router();

outreachRouter.post("/", async (req, res) => {
  const { jobIds = [], template } = req.body || {};

  if (!jobIds.length || !template) {
    return res.status(400).json({ error: "jobIds and template are required" });
  }

  try {
    const jobs = await query("SELECT * FROM job_postings WHERE id = ANY($1)", [jobIds]);

    const sends = [];
    for (const job of jobs.rows) {
      const emails = job.extracted_emails || [];
      const personalized = template
        .replace(/\{\{jobTitle\}\}/g, job.job_title || "")
        .replace(/\{\{company\}\}/g, job.company || "");

      for (const email of emails) {
        const messageId = await sendEmail(email, personalized);
        const log = await query(
          "INSERT INTO outreach_logs (job_id, target_email, message_id) VALUES ($1, $2, $3) RETURNING *",
          [job.id, email, messageId]
        );
        sends.push(log.rows[0]);
      }
    }

    return res.json({ sends });
  } catch (error) {
    return res.status(500).json({ error: "Outreach failed" });
  }
});
