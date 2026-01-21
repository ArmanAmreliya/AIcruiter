-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'STARTED',
    resume_url TEXT,
    meta_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone (candidates) to insert a record so they can join
-- We might want to restrict this slightly in production, but for now public insert is standard for this flow
CREATE POLICY "Public candidates can join interviews" 
ON candidates FOR INSERT 
WITH CHECK (true);

-- Policy: Recruiters can view candidates for their jobs
-- (Assuming jobs table has user_id, we link candidates -> jobs -> user_id)
CREATE POLICY "Recruiters can view candidates for their jobs"
ON candidates FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM jobs
        WHERE jobs.id = candidates.job_id
        AND jobs.user_id = auth.uid()
    )
);

-- Policy: Candidate can view their own record? (For the active room)
-- Usually handled by returning the inserted row or keeping state in memory. 
-- For persistent sessions, we might store a cookie/token, but strict RLS for 'select' might block public retrieval.
-- We'll allow public Select by ID if needed, or rely on the Insert return.
-- For safety, let's allow Select if the ID matches (requires known ID)
-- Actually, typically for 'join' flow, we just rely on the return data from INSERT.
