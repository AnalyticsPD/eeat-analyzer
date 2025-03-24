"use client"

import { useState, useEffect } from "react"

export function PageHeader() {
  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    // Check if we're in a preview environment
    const isPreviewEnv =
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname === "localhost" ||
      window.location.hostname.includes("github.dev")

    setIsPreview(isPreviewEnv)
  }, [])

  return (
    <div className="mb-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight mb-3">EEAT Webpage Analyzer</h1>
      <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
        Analyze your webpage against Google's Experience, Expertise, Authoritativeness, and Trustworthiness (EEAT)
        guidelines, helpful content criteria, and Search Quality Rater Guidelines.
      </p>

      {isPreview && (
        <div className="mt-4 inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-md text-sm">
          Preview Mode - Using demo data for demonstration purposes
        </div>
      )}
    </div>
  )
}

