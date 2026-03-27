const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zyqwbktutyaivikfjovq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5cXdia3R1dHlhaXZpa2Zqb3ZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjAzNDQwNiwiZXhwIjoyMDg3NjEwNDA2fQ.vcv6yZRxLmhoApqCwylRHiZN3iEFjziceUSQzxBKyQg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('coaching_chat_archive').select('*').limit(1);
  console.log('Error:', error);
  console.log('Data:', data);
}

check();
