-- Add audio_url to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS audio_url TEXT;
