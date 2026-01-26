import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

// For development, use placeholder if env vars are not set
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co'
const finalKey = supabaseKey || 'placeholder-key'

export const supabase = createClient(finalUrl, finalKey)