import path from "path";
import { fileURLToPath } from "url";
import { scrapeJobPosting } from "../src/services/scraper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("scraper module", () => {
  test("extracts fields and emails from local fixture", async () => {
    const fixturePath = path.join(__dirname, "fixtures-job.html");
    const url = `file://${fixturePath}`;
    const result = await scrapeJobPosting(url);
    expect(result.jobTitle).toContain("Frontend Engineer");
    expect(result.company).toContain("Acme Corp");
    expect(result.extractedEmails).toEqual(["hiring@acme.test", "jobs@acme.test"]);
  }, 60000);
});
