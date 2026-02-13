CREATE TABLE IF NOT EXISTS job_postings (
  id SERIAL PRIMARY KEY,
  job_title TEXT NOT NULL,
  company TEXT,
  description TEXT,
  source_url TEXT NOT NULL,
  extracted_emails TEXT[] DEFAULT ARRAY[]::TEXT[],
  compliance_status JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outreach_logs (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES job_postings(id) ON DELETE CASCADE,
  target_email TEXT NOT NULL,
  message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
