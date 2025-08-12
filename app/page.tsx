"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Loader2, FileSpreadsheet, Sparkles, History, Globe, Zap, ArrowRight, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

interface Summary {
  id: string
  user_id: string
  sheet_url: string
  summary: string
  created_at: string
}

export default function HomePage() {
  const { session, user, loading, signIn, signOut } = useAuth()
  const [sheetUrl, setSheetUrl] = useState("")
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [summaries, setSummaries] = useState<Summary[]>([])

  const handleSignOut = async () => {
    await signOut()
    setSheetUrl("")
    setError("")
    setSuccess("")
    setSummaries([])
  }

  const generateReport = async () => {
    if (!sheetUrl.trim()) {
      setError("Iltimos, Google Sheet havolasini kiriting.")
      return
    }

    if (!user) {
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
        credentials: "include",
        body: JSON.stringify({ sheetUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Hisobot yaratishda muammo yuz berdi.")
      }

      setSuccess(`Hisobot muvaffaqiyatli yaratildi! ${data.rowsAnalyzed} ta qator tahlil qilindi.`)
      setSheetUrl("")

      if (data.summary) {
        const newSummary: Summary = {
          id: Date.now().toString(),
          user_id: user.id,
          sheet_url: sheetUrl,
          summary: data.summary,
          created_at: new Date().toISOString(),
        }
        setSummaries((prev) => [newSummary, ...prev.slice(0, 4)])
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center space-y-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Qisqa</h1>
          </motion.div>

          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block font-medium max-w-32 truncate">
                  {user.user_metadata?.name || user.email}
                </span>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Chiqish
                </Button>
              </>
            ) : (
              <Button
                onClick={signIn}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Google bilan kirish
              </Button>
            )}
          </motion.div>
        </div>
      </motion.header>

      <main>
        <section className="pt-16 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12"
            >
              <motion.div
                className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Sun'iy intellekt bilan tahlil
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-tight">
                Ma'lumotlaringizdan{" "}
                <span className="text-primary relative">
                  qisqa
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/20 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                  />
                </span>{" "}
                va aniq hisobotlar
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Google Sheet havolasini yuboring va Qisqa siz uchun tahlil natijasini qisqacha yozadi.
              </p>
            </motion.div>

            {user && (
              <motion.div
                className="max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 sm:p-8">
                    <div className="space-y-6">
                      <div className="relative">
                        <Input
                          type="url"
                          placeholder="Google Sheet havolasini kiriting..."
                          value={sheetUrl}
                          onChange={(e) => setSheetUrl(e.target.value)}
                          className="w-full py-4 px-4 text-base border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                        />
                        {sheetUrl && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </motion.div>
                        )}
                      </div>

                      {error && (
                        <motion.div
                          className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <p className="text-destructive text-sm font-medium">{error}</p>
                        </motion.div>
                      )}

                      {success && (
                        <motion.div
                          className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <p className="text-green-700 dark:text-green-400 text-sm font-medium">{success}</p>
                        </motion.div>
                      )}

                      <Button
                        onClick={generateReport}
                        disabled={generating || !sheetUrl.trim()}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-base font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Hisobot yaratilmoqda...
                          </>
                        ) : (
                          <>
                            Hisobot yaratish
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">Nima uchun Qisqa?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Zamonaviy texnologiyalar yordamida ma'lumotlaringizni tez va aniq tahlil qiling
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <Card className="h-full bg-card/50 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-lg hover:bg-card/80 transition-all duration-300 group-hover:-translate-y-2">
                    <CardContent className="p-6 text-center">
                      <motion.div
                        className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <feature.icon className="h-6 w-6 text-primary" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {user && summaries.length > 0 && (
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-4xl">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="bg-card border border-border shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 text-xl font-semibold">
                      <History className="h-5 w-5 text-primary" />
                      <span>Oxirgi hisobotlar</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {summaries.map((summary, index) => (
                        <motion.div
                          key={summary.id}
                          className="p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-all duration-200 border border-border/50"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm text-muted-foreground truncate flex-1 mr-4 font-medium">
                              {summary.sheet_url}
                            </p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap bg-background px-2 py-1 rounded-full border border-border">
                              {new Date(summary.created_at).toLocaleDateString("uz-UZ")}
                            </span>
                          </div>
                          <p className="text-foreground line-clamp-3 leading-relaxed text-sm">{summary.summary}</p>
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

      <footer className="bg-muted/50 border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Qisqa</h3>
            </div>
            <p className="text-muted-foreground mb-4">Ma'lumotlaringizdan qisqa va aniq hisobotlar</p>
            <p className="text-muted-foreground/70 text-sm">© 2025 Qisqa. Barcha huquqlar himoyalangan.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
