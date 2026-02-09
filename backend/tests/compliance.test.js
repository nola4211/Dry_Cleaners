import { _internal, checkRobots, safeToScrape, scanTosText } from "../src/services/compliance.js";

const { containsBlockedLanguage } = _internal;

describe("TOS keyword scanning", () => {
  test("detects blocked phrases", () => {
    expect(containsBlockedLanguage("No scraping allowed")).toBe(true);
    expect(containsBlockedLanguage("Robots and bots are prohibited")).toBe(true);
    expect(containsBlockedLanguage("All access permitted")).toBe(false);
  });

  test("returns tosOK true for safe text", () => {
    const result = scanTosText("We welcome manual access.");
    expect(result.tosOK).toBe(true);
  });
});

describe("robots.txt parser", () => {
  test("allows when rule permits", async () => {
    const url = "https://example.com/jobs/1";
    const response = await checkRobots(url, ["example.com"]);
    expect(response.robotsOK).toBe(true);
  });
});

describe("safeToScrape decision", () => {
  test("deny list blocks", async () => {
    const result = await safeToScrape("https://blocked.com/job", { denyList: ["blocked.com"] });
    expect(result.allowed).toBe(false);
  });
});
