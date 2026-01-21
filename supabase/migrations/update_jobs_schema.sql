-- Add new columns to the jobs table for advanced interview configuration
DO $$ 
BEGIN
    -- Add job_role if it doesn't exist (assuming 'title' might be used for this, but adding specific column is safer for separation)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'job_role') THEN
        ALTER TABLE jobs ADD COLUMN job_role TEXT;
    END IF;

    -- Add duration_minutes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'duration_minutes') THEN
        ALTER TABLE jobs ADD COLUMN duration_minutes INTEGER DEFAULT 15;
    END IF;

    -- Add interview_type as an array of text
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'interview_type') THEN
        ALTER TABLE jobs ADD COLUMN interview_type TEXT[] DEFAULT ARRAY['Technical'];
    END IF;

    -- Add experience_level
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'experience_level') THEN
        ALTER TABLE jobs ADD COLUMN experience_level TEXT DEFAULT 'Mid-Level';
    END IF;

    -- Ensure status exists (usually it does, but good to check or set default)
    -- If created previously without default, this won't change existing rows but sets for new ones
    ALTER TABLE jobs ALTER COLUMN status SET DEFAULT 'DRAFT';

END $$;
