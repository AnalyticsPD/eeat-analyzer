"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AnalysisResults } from "@/components/analysis-results"

export function UrlForm() {
  const [url, setUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url) {
      setError("Please enter a URL")
      return
    }

    try {
      setIsAnalyzing(true)
      setError("")

      // Simulate analysis delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Use mock data for preview
      setResults(getMockAnalysisResults())
    } catch (err: any) {
      setError("Failed to analyze the URL. Please try again.")
      console.error(err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Mock data for preview
  const getMockAnalysisResults = () => {
    return {
      overallScore: 72,
      eeatScore: 68,
      helpfulContentScore: 75,
      visualScore: 73,
      url: url,
      screenshot: `/placeholder.svg?height=600&width=800`,
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

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium">
            Enter webpage URL to analyze
          </label>
          <div className="flex gap-2">
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" disabled={isAnalyzing}>
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </form>

      {isAnalyzing && (
        <div className="mt-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-muted-foreground">Analyzing webpage content and structure...</p>
        </div>
      )}

      {results && <AnalysisResults results={results} />}
    </Card>
  )
}

