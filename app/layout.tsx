import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Qisqa - Ma'lumotlaringizdan qisqa va aniq hisobotlar",
  description: "Google Sheet havolasini yuboring va Qisqa siz uchun tahlil natijasini qisqacha yozadi.",
  keywords: ["Google Sheets", "AI", "Tahlil", "Hisobot", "O'zbek tili"],
  authors: [{ name: "Qisqa Team" }],
  openGraph: {
    title: "Qisqa - Ma'lumotlaringizdan qisqa va aniq hisobotlar",
    description: "Google Sheet havolasini yuboring va Qisqa siz uchun tahlil natijasini qisqacha yozadi.",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
