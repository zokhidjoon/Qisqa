import { createClient } from "@supabase/supabase-js"

const validateEnvVar = (name: string, value: string | undefined): string => {
  if (!value) {
    console.error(
      `❌ Missing environment variable: ${name}\n\n` +
        `Please add the following to your .env.local file:\n` +
        `${name}="your_actual_value_here"\n\n` +
        `Get your Supabase credentials from: https://supabase.com/dashboard`,
    )
    // Return placeholder for build compatibility
    return name === "NEXT_PUBLIC_SUPABASE_URL" ? "https://placeholder.supabase.co" : "placeholder"
  }

  if (value.includes("placeholder") || value.includes("YOUR_SUPABASE")) {
    console.warn(
      `⚠️ Using placeholder value for ${name}\n\n` +
        `To enable authentication, replace with actual values from:\n` +
        `https://supabase.com/dashboard → Your Project → Settings → API\n\n` +
        `Set real values in Vercel Environment Variables after deployment.`,
    )
    return value
  }

  if (name === "NEXT_PUBLIC_SUPABASE_URL" && !value.includes("placeholder")) {
    try {
      new URL(value)
      if (!value.includes("supabase.co")) {
        console.error("URL should be a Supabase project URL")
        return "https://placeholder.supabase.co"
      }
    } catch {
      console.error(
        `❌ Invalid URL format for ${name}\n\n` +
          `Expected format: https://your-project-id.supabase.co\n` +
          `Current value: ${value}`,
      )
      return "https://placeholder.supabase.co"
    }
  }

  return value
}

const supabaseUrl = validateEnvVar("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL)
const supabaseAnonKey = validateEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

let supabase: any

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  })
} catch (error) {
  console.error("Failed to initialize Supabase client:", error)
  // Create a mock client for build compatibility
  supabase = {
    auth: {
      signInWithOAuth: () => Promise.resolve({ error: new Error("Supabase not configured") }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
    }),
  }
}

export { supabase }

// Database types
export interface Summary {
  id: string
  user_id: string
  sheet_url: string
  summary: string
  created_at: string
}

export const getRedirectUrl = () => {
  const productionUrl = "https://v0-qisqa-web-app.vercel.app"

  // For development
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:3000"
  }

  // For production - use the specific production URL
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_SITE_URL || productionUrl
  }

  // Fallback for server-side
  return process.env.NEXT_PUBLIC_SITE_URL || productionUrl
}
