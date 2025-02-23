import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

// Replace these with your Supabase project credentials
const supabaseUrl = 'https://fibvcclvshljxlxlgkns.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpYnZjY2x2c2hsanhseGxna25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMTUyODgsImV4cCI6MjA1NTg5MTI4OH0.9wWNKl2iVGd4-1L0jXL-GKT0PDSQwCnKq1BKIwrLMcU'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}) 