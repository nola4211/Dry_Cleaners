import { chromium } from "playwright";

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

const dedupeEmails = (emails = []) => {
  const cleaned = emails
    .map((email) => email.trim().toLowerCase())
    .filter((email) => !email.includes(".."));
  return [...new Set(cleaned)];
};

export const scrapeJobPosting = async (url) => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

  const data = await page.evaluate(() => {
    const title = document.querySelector("h1")?.textContent?.trim() || document.title;
    const company =
      document.querySelector('[data-company]')?.textContent?.trim() ||
      document.querySelector('.company')?.textContent?.trim() ||
      "";
    const description =
      document.querySelector("main")?.textContent?.trim() ||
      document.body?.textContent?.trim() ||
      "";
    return { title, company, description };
  });

  const pageText = await page.content();
  const emails = pageText.match(EMAIL_REGEX) || [];

  await browser.close();

  return {
    jobTitle: data.title,
    company: data.company,
    description: data.description,
    extractedEmails: dedupeEmails(emails)
  };
};

export const _internal = { EMAIL_REGEX, dedupeEmails };
