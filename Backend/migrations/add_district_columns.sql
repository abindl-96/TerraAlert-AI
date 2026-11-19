-- Add district column to user table (for Kerala districts)
-- Run each ALTER separately; ignore error if column already exists
ALTER TABLE user ADD COLUMN district VARCHAR(100) AFTER location;

-- Add district column to risk_predictions table
ALTER TABLE risk_predictions ADD COLUMN district VARCHAR(100) AFTER pincode;

-- Add district column to notifications table
ALTER TABLE notifications ADD COLUMN district VARCHAR(100) AFTER pincode;
