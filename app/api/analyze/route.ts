import { type NextRequest, NextResponse } from "next/server"
import { analyzeUrl } from "@/lib/analyze-url"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Check if we're in a preview environment
    const isPreview = process.env.VERCEL_ENV === "preview" || process.env.VERCEL_ENV === "development"

    if (isPreview) {
      // In preview, return mock data
      return NextResponse.json(getMockAnalysisResults(url))
    }

    // In production, perform the actual analysis
    const analysisResults = await analyzeUrl(url)

    return NextResponse.json(analysisResults)
  } catch (error) {
    console.error("Error in analyze route:", error)
    return NextResponse.json({ error: `Failed to analyze the URL: ${error.message}` }, { status: 500 })
  }
}

// Mock data function for preview mode
function getMockAnalysisResults(url: string) {
  return {
    overallScore: 72,
    eeatScore: 68,
    helpfulContentScore: 75,
    visualScore: 73,
    url: url,
    metadata: {
      title: "Example Website - Homepage",
      description: "This is an example website for demonstration purposes.",
      wordCount: 1250,
      readingTime: 6,
      hasAuthorInfo: true,
      hasDates: true,
      hasReferences: true,
      hasSchema: false,
    },
    eeatAnalysis: {
      strengths: [
        "Clear author credentials and expertise displayed on article pages",
        "Content includes citations to authoritative sources",
        "About page provides detailed company background and team expertise",
      ],
      weaknesses: [
        "Limited evidence of first-hand experience in some topic areas",
        "Inconsistent attribution of sources across different content sections",
        "Missing credentials for some content contributors",
      ],
      recommendations: [
        "Add author bios with relevant qualifications to all content pieces",
        "Include more case studies and first-hand experiences to demonstrate expertise",
        "Implement structured data markup for author expertise and organization credentials",
      ],
    },
    helpfulContentAnalysis: {
      strengths: [
        "Content addresses specific user questions comprehensively",
        "Clear, scannable structure with helpful headings and subheadings",
        "Provides unique insights not found in competing content",
      ],
      weaknesses: [
        "Some content appears to be written primarily for search engines rather than users",
        "Excessive keyword usage in certain sections feels unnatural",
        "Limited use of helpful multimedia elements to enhance understanding",
      ],
      recommendations: [
        "Revise content to focus on solving user problems rather than keyword optimization",
        "Add more practical examples, images, and videos to illustrate key points",
        "Expand content depth in areas where user questions aren't fully addressed",
      ],
    },
    visualAnalysis: {
      strengths: [
        "Clean, professional layout that enhances content readability",
        "Consistent branding elements establish visual trustworthiness",
        "Good use of white space and typography hierarchy",
      ],
      weaknesses: [
        "Mobile responsiveness issues on some content sections",
        "Inconsistent image quality throughout the site",
        "Some interactive elements lack clear visual affordances",
      ],
      recommendations: [
        "Improve mobile layout, especially for tables and complex content",
        "Standardize image quality and implement lazy loading for performance",
        "Enhance visual cues for interactive elements to improve usability",
      ],
    },
  }
}

