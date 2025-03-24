import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { scrapeWebpage, type ScrapedData } from "./web-scraper"

export async function analyzeUrl(url: string) {
  try {
    // Scrape the webpage to get content
    const scrapedData = await scrapeWebpage(url)

    // Use AI to analyze the content against EEAT guidelines
    const analysis = await performAIAnalysis(url, scrapedData)

    return {
      ...analysis,
      url,
      metadata: {
        title: scrapedData.title,
        description: scrapedData.description,
        wordCount: scrapedData.wordCount,
        readingTime: scrapedData.readingTime,
        hasAuthorInfo: scrapedData.hasAuthorInfo,
        hasDates: scrapedData.hasDates,
        hasReferences: scrapedData.hasReferences,
        hasSchema: scrapedData.hasSchema,
      },
    }
  } catch (error) {
    console.error("Error analyzing URL:", error)
    throw new Error(`Failed to analyze the URL: ${error.message}`)
  }
}

// Perform AI analysis on the content
async function performAIAnalysis(url: string, scrapedData: ScrapedData) {
  // Check if OpenAI API key is available
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (!openaiApiKey) {
    throw new Error("OpenAI API key is missing. Please add it to your environment variables.")
  }

  // Prepare data for analysis
  const analysisData = {
    url,
    title: scrapedData.title,
    description: scrapedData.description,
    content: scrapedData.textContent.substring(0, 15000), // Limit content length for API
    headings: scrapedData.headings,
    hasAuthorInfo: scrapedData.hasAuthorInfo,
    author: scrapedData.author,
    hasDates: scrapedData.hasDates,
    datePublished: scrapedData.datePublished,
    hasReferences: scrapedData.hasReferences,
    hasSchema: scrapedData.hasSchema,
    wordCount: scrapedData.wordCount,
    readingTime: scrapedData.readingTime,
    imageCount: scrapedData.images.length,
  }

  const prompt = `
    You are an expert SEO consultant specializing in Google's EEAT (Experience, Expertise, Authoritativeness, Trustworthiness) guidelines, helpful content guidelines, and Search Quality Rater Guidelines.
    
    Analyze this webpage (${url}) based on the following extracted data:
    
    Title: ${analysisData.title}
    Description: ${analysisData.description}
    Word Count: ${analysisData.wordCount}
    Reading Time: ${analysisData.readingTime} minutes
    Has Author Info: ${analysisData.hasAuthorInfo}
    Author: ${analysisData.author || "Not specified"}
    Has Publication Date: ${analysisData.hasDates}
    Date Published: ${analysisData.datePublished || "Not specified"}
    Has External References: ${analysisData.hasReferences}
    Has Schema Markup: ${analysisData.hasSchema}
    Image Count: ${analysisData.imageCount}
    
    Headings Structure:
    ${analysisData.headings.slice(0, 20).join("\n")}
    
    Content Preview:
    ${analysisData.content.substring(0, 3000)}...
    
    Provide a comprehensive analysis with:
    
    1. Overall score (0-100)
    2. EEAT score (0-100) - Evaluate Experience, Expertise, Authoritativeness, and Trustworthiness
    3. Helpful content score (0-100) - Evaluate alignment with Google's helpful content guidelines
    4. Visual score (0-100) - Evaluate visual presentation and structure
    
    5. EEAT analysis:
       - 3 specific strengths with clear examples from the content
       - 3 specific weaknesses with clear examples from the content
       - 3 specific, actionable recommendations to improve EEAT signals
    
    6. Helpful content analysis:
       - 3 specific strengths with clear examples from the content
       - 3 specific weaknesses with clear examples from the content
       - 3 specific, actionable recommendations to improve helpful content signals
    
    7. Visual analysis:
       - 3 specific strengths related to layout, structure, and readability
       - 3 specific weaknesses related to layout, structure, and readability
       - 3 specific, actionable recommendations to improve visual presentation
    
    Format the response as a JSON object with these exact fields:
    {
      "overallScore": number,
      "eeatScore": number,
      "helpfulContentScore": number,
      "visualScore": number,
      "eeatAnalysis": {
        "strengths": [string, string, string],
        "weaknesses": [string, string, string],
        "recommendations": [string, string, string]
      },
      "helpfulContentAnalysis": {
        "strengths": [string, string, string],
        "weaknesses": [string, string, string],
        "recommendations": [string, string, string]
      },
      "visualAnalysis": {
        "strengths": [string, string, string],
        "weaknesses": [string, string, string],
        "recommendations": [string, string, string]
      }
    }
  `

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
    })

    // Parse the JSON response
    return JSON.parse(text)
  } catch (error) {
    console.error("Error in AI analysis:", error)
    throw new Error(`AI analysis failed: ${error.message}`)
  }
}

