-- Row Level Security (RLS) Setup for Supabase
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Create the email_list table (if not exists)
CREATE TABLE IF NOT EXISTS email_list (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE email_list ENABLE ROW LEVEL SECURITY;

-- 3. Create policy to allow INSERT only (no reading of other emails)
CREATE POLICY "Allow public insert" ON email_list
    FOR INSERT 
    TO anon 
    WITH CHECK (true);

-- 4. Create policy to prevent reading other people's emails
CREATE POLICY "Prevent public read" ON email_list
    FOR SELECT 
    TO anon 
    USING (false);

-- 5. Create policy to prevent updates/deletes
CREATE POLICY "Prevent public update" ON email_list
    FOR UPDATE 
    TO anon 
    USING (false);

CREATE POLICY "Prevent public delete" ON email_list
    FOR DELETE 
    TO anon 
    USING (false);

-- 6. Add email validation constraint
ALTER TABLE email_list 
ADD CONSTRAINT valid_email 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 7. Add name validation constraint
ALTER TABLE email_list 
ADD CONSTRAINT valid_name 
CHECK (char_length(name) >= 2 AND char_length(name) <= 50);

-- 8. Create index for performance
CREATE INDEX IF NOT EXISTS idx_email_list_email ON email_list(email);
CREATE INDEX IF NOT EXISTS idx_email_list_created_at ON email_list(created_at);

-- These policies ensure that:
-- ✅ People can only add emails to the list
-- ❌ People cannot read existing emails
-- ❌ People cannot update or delete entries
-- ✅ Only authenticated users (you) can read/manage the data