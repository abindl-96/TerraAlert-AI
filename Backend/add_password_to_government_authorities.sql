-- Migration: Add password column to existing government_authorities table
-- Run this if the table already exists without password field

USE terraalertai;

-- Add password column if it doesn't exist
ALTER TABLE government_authorities 
ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT 'gov123' AFTER phone_number;

-- Update existing records with default password (change this in production!)
-- Note: In production, you should set proper passwords for each authority
UPDATE government_authorities 
SET password = 'gov123' 
WHERE password IS NULL OR password = '';

-- Make password required (remove default after setting passwords)
ALTER TABLE government_authorities 
MODIFY COLUMN password VARCHAR(255) NOT NULL;
