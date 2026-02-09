import axios from "axios";
import robotsParser from "robots-parser";

const TOS_PATHS = [
  "/terms",
  "/tos",
  "/terms-of-service",
  "/terms-of-service.html",
  "/terms.html"
];

const BLOCK_PATTERNS = [
  "no scraping",
  "automated access",
  "robot",
  "bot",
  "crawler",
  "harvest",
  "prohibited",
  "no data extraction",
  "no automated collection"
];

const normalizeDomain = (url) => {
  const parsed = new URL(url);
  return parsed.hostname.toLowerCase();
};

const containsBlockedLanguage = (text) => {
  const lower = text.toLowerCase();
  return BLOCK_PATTERNS.some((pattern) => lower.includes(pattern));
};

export const scanTosText = (text) => ({
  tosOK: !containsBlockedLanguage(text),
  reason: containsBlockedLanguage(text) ? \"Blocked by TOS keyword\" : \"TOS text clear\"
});

export const checkRobots = async (url, allowList = []) => {
  const domain = normalizeDomain(url);
  if (allowList.includes(domain)) {
    return { robotsOK: true, reason: "Allow-list override" };
  }

  const robotsUrl = `https://${domain}/robots.txt`;
  try {
    const response = await axios.get(robotsUrl, { timeout: 5000 });
    const parser = robotsParser(robotsUrl, response.data);
    const allowed = parser.isAllowed(url, "*");
    return {
      robotsOK: Boolean(allowed),
      reason: allowed ? "Allowed by robots.txt" : "Disallowed by robots.txt"
    };
  } catch (error) {
    return { robotsOK: false, reason: "robots.txt unavailable" };
  }
};

export const checkTos = async (url) => {
  const domain = normalizeDomain(url);
  const baseUrl = `https://${domain}`;

  for (const path of TOS_PATHS) {
    const tosUrl = `${baseUrl}${path}`;
    try {
      const response = await axios.get(tosUrl, { timeout: 5000 });
      const text = response.data?.toString?.() ?? "";
      if (text) {
        const blocked = containsBlockedLanguage(text);
        return {
          tosOK: !blocked,
          reason: blocked ? `Blocked by TOS keyword at ${path}` : "TOS reviewed"
        };
      }
    } catch (error) {
      continue;
    }
  }

  return { tosOK: false, reason: "TOS unavailable or ambiguous" };
};

export const safeToScrape = async (url, { allowList = [], denyList = [] } = {}) => {
  const domain = normalizeDomain(url);
  if (denyList.includes(domain)) {
    return {
      allowed: false,
      robotsOK: false,
      tosOK: false,
      reason: "Domain is on deny-list"
    };
  }

  const robotsResult = await checkRobots(url, allowList);
  const tosResult = await checkTos(url);

  const allowed = robotsResult.robotsOK && tosResult.tosOK;
  const reason = allowed
    ? "Robots.txt and TOS checks passed"
    : `${robotsResult.reason}; ${tosResult.reason}`;

  return {
    allowed,
    robotsOK: robotsResult.robotsOK,
    tosOK: tosResult.tosOK,
    reason
  };
};

export const _internal = {
  containsBlockedLanguage,
  normalizeDomain
};
