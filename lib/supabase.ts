import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export const getRedirectUrl = () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (typeof window !== "undefined") {
    // Client-side: detect environment
    const isLocalhost = window.location.hostname === "localhost"
    if (isLocalhost) {
      return "http://localhost:3000"
    }
    return siteUrl || window.location.origin
  }

  // Server-side: use environment variable or fallback
  return siteUrl || "https://v0-qisqa-web-app.vercel.app"
}
