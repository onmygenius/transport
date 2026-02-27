-- Enable Realtime for chat_messages table
-- This must be run in Supabase SQL Editor

-- Enable realtime publication for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Verify it's enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'chat_messages';
