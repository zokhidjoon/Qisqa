"use client"

import { useState, useEffect } from "react"
import { supabase, getRedirectUrl } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, FileSpreadsheet, Sparkles, History, Globe, Zap } from "lucide-react"
import { motion } from "framer-motion"

interface Summary {
  id: string
  user_id: string
  sheet_url: string
  summary: string
  created_at: string
}

export default function HomePage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sheetUrl, setSheetUrl] = useState("")
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [summaries, setSummaries] = useState<Summary[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session?.user) {
      setSummaries([])
    }
  }, [session])

  const handleSignIn = async () => {
    const redirectUrl = getRedirectUrl()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    })
    if (error) {
      setError("Tizimga kirishda xatolik yuz berdi.")
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      setError("Tizimdan chiqishda xatolik yuz berdi.")
    } else {
      setSheetUrl("")
      setError("")
      setSuccess("")
      setSummaries([])
    }
  }

  const generateReport = async () => {
    if (!sheetUrl.trim()) {
      setError("Iltimos, Google Sheet havolasini kiriting.")
      return
    }

    if (!session?.user) {
      setError("Iltimos, avval tizimga kiring.")
      return
    }

    setGenerating(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/generateReport", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sheetUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Hisobot yaratishda muammo yuz berdi.")
      }

      setSuccess("Hisobot muvaffaqiyatli yaratildi!")
      setSheetUrl("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-[#007BFF]" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <motion.header
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <FileSpreadsheet className="h-7 w-7 text-[#007BFF]" />
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Qisqa</h1>
          </motion.div>

          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {session?.user ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:block font-medium">
                  {session.user.user_metadata?.name || session.user.email}
                </span>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Chiqish
                </Button>
              </>
            ) : (
              <Button
                onClick={handleSignIn}
                className="bg-[#007BFF] hover:bg-[#0056b3] text-white px-6 py-2 rounded-full font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Google bilan kirish
              </Button>
            )}
          </motion.div>
        </div>
      </motion.header>

      <main>
        <section className="pt-20 pb-32 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12"
            >
              <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6 tracking-tight leading-tight">
                Ma'lumotlaringizdan <span className="text-[#007BFF]">qisqa</span> va aniq hisobotlar
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
                Google Sheet havolasini yuboring va Qisqa siz uchun tahlil natijasini qisqacha yozadi.
              </p>
            </motion.div>

            {session?.user && (
              <motion.div
                className="max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div>
                        <Input
                          type="url"
                          placeholder="Google Sheet havolasini kiriting..."
                          value={sheetUrl}
                          onChange={(e) => setSheetUrl(e.target.value)}
                          className="w-full py-4 px-4 text-base border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007BFF] focus:border-transparent"
                        />
                      </div>

                      {error && (
                        <motion.div
                          className="p-4 bg-red-50 border border-red-200 rounded-lg"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <p className="text-red-700 text-sm">{error}</p>
                        </motion.div>
                      )}

                      {success && (
                        <motion.div
                          className="p-4 bg-green-50 border border-green-200 rounded-lg"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <p className="text-green-700 text-sm">{success}</p>
                        </motion.div>
                      )}

                      <Button
                        onClick={generateReport}
                        disabled={generating || !sheetUrl.trim()}
                        className="w-full bg-[#007BFF] hover:bg-[#0056b3] text-white py-4 text-base font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Hisobot yaratilmoqda...
                          </>
                        ) : (
                          "Hisobot yaratish"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </section>

        <section className="py-24 bg-gradient-to-b from-gray-50/50 to-white">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-semibold text-gray-900 mb-4 tracking-tight">Nima uchun Qisqa?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                Zamonaviy texnologiyalar yordamida ma'lumotlaringizni tez va aniq tahlil qiling
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: FileSpreadsheet,
                  title: "Oson foydalanish",
                  description: "Google Sheet havolasini joylashtiring va natijani kuting",
                  delay: 0.1,
                },
                {
                  icon: Sparkles,
                  title: "Sun'iy intellekt",
                  description: "Ilg'or AI texnologiyasi yordamida aniq tahlil",
                  delay: 0.2,
                },
                {
                  icon: Zap,
                  title: "Tez natija",
                  description: "Bir necha soniyada tayyor hisobot",
                  delay: 0.3,
                },
                {
                  icon: Globe,
                  title: "O'zbek tilida",
                  description: "Barcha hisobotlar o'zbek tilida tayyorlanadi",
                  delay: 0.4,
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="group"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: feature.delay }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-lg hover:bg-white/90 transition-all duration-300 group-hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <motion.div
                        className="w-12 h-12 bg-[#007BFF]/10 rounded-xl flex items-center justify-center mx-auto mb-4"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <feature.icon className="h-6 w-6 text-[#007BFF]" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 tracking-tight">{feature.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed font-light">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {session?.user && summaries.length > 0 && (
          <section className="py-16 px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="bg-white border border-gray-200 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 text-xl font-semibold">
                      <History className="h-5 w-5 text-[#007BFF]" />
                      <span>Oxirgi hisobotlar</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {summaries.map((summary, index) => (
                        <motion.div
                          key={summary.id}
                          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm text-gray-600 truncate flex-1 mr-4 font-medium">
                              {summary.sheet_url}
                            </p>
                            <span className="text-xs text-gray-500 whitespace-nowrap bg-white px-2 py-1 rounded-full">
                              {new Date(summary.created_at).toLocaleDateString("uz-UZ")}
                            </span>
                          </div>
                          <p className="text-gray-800 line-clamp-3 leading-relaxed text-sm">{summary.summary}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <FileSpreadsheet className="h-6 w-6 text-white" />
              <h3 className="text-xl font-semibold">Qisqa</h3>
            </div>
            <p className="text-gray-400 mb-4 font-light">Ma'lumotlaringizdan qisqa va aniq hisobotlar</p>
            <p className="text-gray-500 text-sm">© 2025 Qisqa. Barcha huquqlar himoyalangan.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
