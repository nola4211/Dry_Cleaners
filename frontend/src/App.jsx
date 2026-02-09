import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const formatCompliance = (status) => {
  if (!status) {
    return "Unknown";
  }
  return status.allowed ? "Allowed" : `Blocked (${status.reason})`;
};

const formatEmails = (emails = []) => emails.join(", ") || "—";

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState({});
  const [template, setTemplate] = useState(
    "Hi {{company}},\n\nI noticed your {{jobTitle}} posting and would love to connect."
  );
  const [status, setStatus] = useState("");

  const loadJobs = async () => {
    setStatus("Loading jobs...");
    const response = await fetch(`${API_BASE}/api/jobs`);
    const data = await response.json();
    setJobs(data.jobs || []);
    setStatus("");
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const toggleJob = (id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, value]) => value).map(([id]) => Number(id)),
    [selected]
  );

  const sendOutreach = async () => {
    if (!selectedIds.length) {
      setStatus("Select at least one job posting.");
      return;
    }

    setStatus("Sending outreach...");
    const response = await fetch(`${API_BASE}/api/outreach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobIds: selectedIds, template })
    });

    if (!response.ok) {
      setStatus("Outreach failed. Please check the backend logs.");
      return;
    }

    setStatus("Outreach sent successfully.");
  };

  return (
    <div className="app">
      <header>
        <h1>Job Outreach Review</h1>
        <p>Review compliant job postings and send outreach emails.</p>
      </header>

      <section className="panel">
        <div className="panel-header">
          <h2>Job Postings</h2>
          <button type="button" onClick={loadJobs}>
            Refresh
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Job Title</th>
              <th>Company</th>
              <th>URL</th>
              <th>Extracted Emails</th>
              <th>Compliance</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={Boolean(selected[job.id])}
                    onChange={() => toggleJob(job.id)}
                  />
                </td>
                <td>{job.job_title}</td>
                <td>{job.company || "—"}</td>
                <td>
                  <a href={job.source_url} target="_blank" rel="noreferrer">
                    View
                  </a>
                </td>
                <td>{formatEmails(job.extracted_emails)}</td>
                <td>{formatCompliance(job.compliance_status)}</td>
              </tr>
            ))}
            {!jobs.length && (
              <tr>
                <td colSpan="6" className="empty">
                  No job postings yet. Run a compliant scrape first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2>Compose outreach email</h2>
        <textarea
          value={template}
          onChange={(event) => setTemplate(event.target.value)}
          rows={6}
        />
        <div className="actions">
          <button type="button" onClick={sendOutreach}>
            Compose outreach email
          </button>
          {status && <span className="status">{status}</span>}
        </div>
      </section>
    </div>
  );
}
