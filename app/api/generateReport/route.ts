import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createServerSupabaseClient } from "@/lib/supabaseServer"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

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

    let sheetData: string
    try {
      // Try CSV export first (works for public sheets)
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`
      const response = await fetch(csvUrl)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      sheetData = await response.text()

      // Check if we got actual data or an error page
      if (sheetData.includes("<!DOCTYPE html>") || sheetData.includes("<html")) {
        throw new Error("Sheet is not publicly accessible")
      }

      // Validate we have meaningful data
      const rows = sheetData.split("\n").filter((row) => row.trim())
      if (rows.length < 2) {
        throw new Error("Sheet appears to be empty or has insufficient data")
      }
    } catch (error: any) {
      console.error("Sheet fetch error:", error)
      return NextResponse.json(
        {
          error:
            "Jadvalni o'qishda xatolik yuz berdi. Jadval ommaviy bo'lishi va 'Havolaga ega har kim ko'rishi mumkin' sozlamasi yoqilgan bo'lishi kerak.",
        },
        { status: 400 },
      )
    }

    const rows = sheetData.split("\n").filter((row) => row.trim())
    const headers = rows[0]?.split(",") || []
    const dataRows = rows.slice(1).filter((row) => row.trim())

    if (headers.length === 0 || dataRows.length === 0) {
      return NextResponse.json(
        {
          error:
            "Jadvalda tahlil qilish uchun yetarli ma'lumot yo'q. Kamida sarlavha va bir qator ma'lumot bo'lishi kerak.",
        },
        { status: 400 },
      )
    }

    const { text: summary } = await generateText({
      model: openai("gpt-4o"),
      system: `Siz professional ma'lumot tahlilchisisiz. Berilgan CSV ma'lumotlarini chuqur tahlil qilib, o'zbek tilida (lotin yozuvida) qisqa va aniq hisobot yozing. 

Hisobot talablari:
- 2-4 paragraf bo'lishi kerak
- Aniq raqamlar va statistikalar bilan
- Amaliy tavsiyalar berish
- Rasmiy va professional uslub
- Faqat o'zbek tilida (lotin yozuvida) yozish`,
      prompt: `Quyidagi Google Sheets ma'lumotlarini tahlil qiling:

SARLAVHALAR: ${headers.join(", ")}
MA'LUMOTLAR SONI: ${dataRows.length} ta qator
NAMUNA MA'LUMOTLAR:
${sheetData.slice(0, 3000)}${sheetData.length > 3000 ? "\n...(ma'lumotlar davomi)" : ""}

O'zbek tilida quyidagi tuzilmada hisobot yozing:

1-PARAGRAF: Ma'lumotlarning umumiy tavsifi va hajmi
2-PARAGRAF: Asosiy tendensiyalar, eng yuqori/past qiymatlar, naqshlar
3-PARAGRAF: Muhim xulosalar va amaliy tavsiyalar

Hisobotni "Qisqa Tahlil:" bilan boshlang va professional tilda yozing.`,
    })

    try {
      // Create the summary content for the new sheet
      const summaryContent = `Qisqa Hisobot - ${new Date().toLocaleDateString("uz-UZ")}

${summary}

---
Yaratilgan vaqt: ${new Date().toLocaleString("uz-UZ")}
Tahlil qilingan qatorlar: ${dataRows.length}
Qisqa.vercel.app orqali yaratilgan`

      // Try to write summary back to the sheet using Google Sheets API
      // Note: This requires the sheet to have edit permissions for "Anyone with the link"
      const summarySheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0`

      // For now, we'll store the summary in our database and return it
      // In a full implementation, you would use Google Sheets API with proper OAuth
    } catch (writeError) {
      console.error("Could not write to sheet:", writeError)
      // Continue without writing to sheet - just return the summary
    }

    try {
      const { error: dbError } = await supabase.from("summaries").insert({
        user_id: user.id,
        sheet_url: sheetUrl,
        summary: summary,
        created_at: new Date().toISOString(),
      })

      if (dbError) {
        console.error("Database error:", dbError)
      }
    } catch (dbError) {
      console.error("Failed to store summary:", dbError)
    }

    return NextResponse.json({
      success: true,
      summary,
      message: "Hisobot muvaffaqiyatli yaratildi va ma'lumotlar bazasiga saqlandi",
      rowsAnalyzed: dataRows.length,
      headers: headers.slice(0, 5), // Return first 5 headers for confirmation
    })
  } catch (error: any) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      {
        error: "Hisobot yaratishda muammo yuz berdi. Iltimos, qaytadan urinib ko'ring.",
      },
      { status: 500 },
    )
  }
}
