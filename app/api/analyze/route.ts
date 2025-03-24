import { type NextRequest, NextResponse } from "next/server"
import { analyzeUrl } from "@/lib/analyze-url"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Perform the actual analysis with web scraping and AI evaluation
    const analysisResults = await analyzeUrl(url)

    return NextResponse.json(analysisResults)
  } catch (error) {
    console.error("Error in analyze route:", error)
    return NextResponse.json({ error: `Failed to analyze the URL: ${error.message}` }, { status: 500 })
  }
}

