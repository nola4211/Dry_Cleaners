# Dry Cleaners - Compliant Job Outreach

This repository contains a full-stack starter application for discovering job postings, validating compliance with robots.txt and Terms of Service, extracting contact emails, and sending outreach emails. **Scraping only proceeds when a site explicitly permits it.**

## Tech Stack
- **Backend:** Node.js + Express (Playwright for scraping)
- **Frontend:** React (Vite)
- **Database:** PostgreSQL

## Directory Structure
```
backend/    # Express API, compliance logic, scraping, email sending
frontend/   # React UI for review + outreach
database/   # SQL schema
.env.example
README.md
```

## Setup
1. **Install dependencies**
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```
2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in:
   - Database connection (`DATABASE_URL`)
   - Search API keys (`BING_SEARCH_API_KEY` or `GOOGLE_SEARCH_API_KEY`)
   - Mail provider keys (`SENDGRID_API_KEY` or `MAILGUN_API_KEY`)
   - Allow/Deny lists
3. **Create the database tables**
   ```bash
   psql "$DATABASE_URL" -f database/schema.sql
   ```
4. **Run the backend**
   ```bash
   cd backend
   npm run dev
   ```
5. **Run the frontend**
   ```bash
   cd frontend
   npm run dev
   ```

## Search API
`POST /api/search`
```json
{
  "jobTitle": "Frontend Engineer",
  "skills": ["React", "TypeScript"],
  "location": "Remote",
  "keywords": ["startup"]
}
```
The API uses Bing Web Search by default. Set `SEARCH_PROVIDER=google` to use Google Custom Search instead. The endpoint **only returns URLs** that appear to be job postings — no scraping happens at this stage.

## Compliance Pipeline
Scraping is blocked by default unless every check passes.

### Robots.txt Enforcement
- The service fetches `https://<domain>/robots.txt`.
- Only user-agent `*` is considered.
- If the URL path is disallowed, scraping is blocked.
- If robots.txt cannot be fetched, scraping is blocked.

### Terms of Service (TOS) Heuristics
The service attempts to fetch `/terms`, `/tos`, `/terms-of-service`, etc. Scraping is blocked if any TOS text includes:
- “no scraping”
- “automated access”
- “robot”
- “bot”
- “crawler”
- “harvest”
- “prohibited”
- “no data extraction”
- “no automated collection”

If the TOS page is missing or ambiguous, scraping is blocked by default.

### Allow-List / Deny-List
- `ALLOW_LIST` is a comma-separated list of domains explicitly permitted. It overrides robots.txt **only when explicit permission exists from the site owner**.
- `DENY_LIST` always blocks scraping.

### Default Rule
If any signal is unclear, missing, or forbidden, **the URL is not scraped**.

## Email Outreach
`POST /api/outreach`
```json
{
  "jobIds": [1, 2, 3],
  "template": "Hello {{company}}, I am interested in the {{jobTitle}} role."
}
```
The backend supports SendGrid or Mailgun via environment variables. All sends are logged in PostgreSQL.

## Testing
Run backend tests:
```bash
cd backend
npm test
```

## Legal and Ethical Warning
This project is built with strict compliance to robots.txt and Terms of Service. **Never scrape sites without explicit permission.** Always review local laws, site policies, and legal counsel before performing automated data collection.
