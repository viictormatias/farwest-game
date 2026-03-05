import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

// Build-safe and Robust initialization:
// 1. Checks if variables are provided
// 2. Checks if URL starts with http (to avoid crashes with invalid junk strings)
const isConfigValid = supabaseUrl.startsWith('http') && supabaseAnonKey.length > 0

export const supabase = isConfigValid
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null as any
