import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { supabase } from "@/lib/supabaseClient"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Iltimos, avval tizimga kiring." }, { status: 401 })
    }

    // Verify the session with Supabase
    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Iltimos, avval tizimga kiring." }, { status: 401 })
    }

    const { sheetUrl } = await request.json()

    if (!sheetUrl) {
      return NextResponse.json({ error: "Iltimos, Google Sheet havolasini kiriting." }, { status: 400 })
    }

    // Extract sheet ID from URL
    const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    if (!sheetIdMatch) {
      return NextResponse.json({ error: "Iltimos, to'g'ri Google Sheet havolasini kiriting." }, { status: 400 })
    }

    const sheetId = sheetIdMatch[1]

    // Fetch sheet data as CSV
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`

    let csvData: string
    try {
      const response = await fetch(csvUrl)
      if (!response.ok) {
        throw new Error("Failed to fetch sheet data")
      }
      csvData = await response.text()
    } catch (error) {
      return NextResponse.json(
        {
          error:
            "Jadvalni o'qishda xatolik yuz berdi. Jadval ommaviy bo'lishi va tahrirlash huquqi ochiq bo'lishi kerak.",
        },
        { status: 400 },
      )
    }

    // Parse CSV data (simple parsing for demo)
    const rows = csvData.split("\n").filter((row) => row.trim())
    if (rows.length < 2) {
      return NextResponse.json({ error: "Jadvalda tahlil qilish uchun yetarli ma'lumot yo'q." }, { status: 400 })
    }

    // Generate AI summary in Uzbek
    const { text: summary } = await generateText({
      model: openai("gpt-4o"),
      system: `Siz professional ma'lumot tahlilchisisiz. Berilgan CSV ma'lumotlarini tahlil qilib, o'zbek tilida (lotin yozuvida) qisqa va aniq hisobot yozing. Hisobot 1-3 paragrafdan iborat bo'lishi kerak. Asosiy tendensiyalar, muhim raqamlar va xulosalarni ta'kidlang.`,
      prompt: `Quyidagi CSV ma'lumotlarini tahlil qiling va o'zbek tilida qisqa hisobot yozing:

${csvData.slice(0, 2000)} ${csvData.length > 2000 ? "..." : ""}

Hisobotda quyidagilarni ko'rsating:
- Ma'lumotlarning umumiy tavsifi
- Asosiy tendensiyalar va naqshlar  
- Muhim raqamlar va statistikalar
- Asosiy xulosalar va tavsiyalar`,
    })

    try {
      const { error: dbError } = await supabase.from("summaries").insert({
        user_id: user.id,
        sheet_url: sheetUrl,
        summary: summary,
        created_at: new Date().toISOString(),
      })

      if (dbError) {
        console.error("Database error:", dbError)
        // Continue even if database insert fails
      }
    } catch (dbError) {
      console.error("Failed to store summary:", dbError)
      // Continue even if database insert fails
    }

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      summary,
      message: "Hisobot muvaffaqiyatli yaratildi",
    })
  } catch (error: any) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Hisobot yaratishda muammo yuz berdi." }, { status: 500 })
  }
}
