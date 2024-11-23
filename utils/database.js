const { createClient } = require("@supabase/supabase-js");

const supabase_url = process.env.SUPABASE_URL
const supabase_key = process.env.SUPABASE_KEY

exports.supabase = createClient(supabase_url, supabase_key)