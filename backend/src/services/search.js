import axios from "axios";

const filterJobUrls = (items = []) => {
  return items
    .map((item) => item.link || item.url)
    .filter(Boolean)
    .filter((link) => {
      const lower = link.toLowerCase();
      return (
        lower.includes("/jobs/") ||
        lower.includes("/careers/") ||
        lower.includes("job") ||
        lower.includes("career")
      );
    });
};

export const searchJobs = async ({ jobTitle, skills, location, keywords }) => {
  const provider = process.env.SEARCH_PROVIDER || "bing";
  const queryParts = [jobTitle, location, ...(skills || []), ...(keywords || [])];
  const query = queryParts.filter(Boolean).join(" ");

  if (!query) {
    return [];
  }

  if (provider === "google") {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const engineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    const response = await axios.get("https://www.googleapis.com/customsearch/v1", {
      params: { key: apiKey, cx: engineId, q: query }
    });
    return filterJobUrls(response.data.items || []);
  }

  const apiKey = process.env.BING_SEARCH_API_KEY;
  const response = await axios.get("https://api.bing.microsoft.com/v7.0/search", {
    params: { q: query },
    headers: { "Ocp-Apim-Subscription-Key": apiKey }
  });
  return filterJobUrls(response.data.webPages?.value || []);
};
