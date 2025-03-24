// This file contains a simplified version of the web scraper
// that works with Vercel's serverless functions

export interface ScrapedData {
  title: string
  description: string
  content: string
  textContent: string
  headings: string[]
  links: { text: string; url: string }[]
  images: { alt: string; src: string }[]
  author?: string
  datePublished?: string
  structuredData?: any
  screenshot?: string
  wordCount: number
  readingTime: number
  hasAuthorInfo: boolean
  hasDates: boolean
  hasReferences: boolean
  hasSchema: boolean
}

export async function scrapeWebpage(url: string): Promise<ScrapedData> {
  try {
    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch webpage: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()

    // Use a server-side HTML parser
    const { JSDOM } = require("jsdom")
    const dom = new JSDOM(html, { url })
    const document = dom.window.document

    // Extract basic metadata
    const title = document.querySelector("title")?.textContent || ""
    const description = document.querySelector('meta[name="description"]')?.getAttribute("content") || ""

    // Extract headings
    const headings: string[] = []
    document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((el) => {
      headings.push(el.textContent?.trim() || "")
    })

    // Extract links
    const links: { text: string; url: string }[] = []
    document.querySelectorAll("a").forEach((el) => {
      const href = el.getAttribute("href")
      if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
        links.push({
          text: el.textContent?.trim() || "",
          url: href,
        })
      }
    })

    // Extract images
    const images: { alt: string; src: string }[] = []
    document.querySelectorAll("img").forEach((el) => {
      const src = el.getAttribute("src")
      if (src) {
        images.push({
          alt: el.getAttribute("alt") || "",
          src,
        })
      }
    })

    // Extract author information
    let author = ""
    const authorSelectors = [
      'meta[name="author"]',
      'meta[property="article:author"]',
      ".author",
      ".byline",
      '[rel="author"]',
      '[itemprop="author"]',
    ]

    for (const selector of authorSelectors) {
      const el = document.querySelector(selector)
      if (el) {
        if (el.getAttribute("content")) {
          author = el.getAttribute("content") || ""
        } else {
          author = el.textContent?.trim() || ""
        }
        if (author) break
      }
    }

    // Extract publication date
    let datePublished = ""
    const dateSelectors = [
      'meta[name="date"]',
      'meta[property="article:published_time"]',
      "time",
      '[itemprop="datePublished"]',
      ".published-date",
      ".post-date",
    ]

    for (const selector of dateSelectors) {
      const el = document.querySelector(selector)
      if (el) {
        if (el.getAttribute("content")) {
          datePublished = el.getAttribute("content") || ""
        } else if (el.getAttribute("datetime")) {
          datePublished = el.getAttribute("datetime") || ""
        } else {
          datePublished = el.textContent?.trim() || ""
        }
        if (datePublished) break
      }
    }

    // Extract structured data
    const structuredData: any[] = []
    document.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
      try {
        structuredData.push(JSON.parse(el.textContent || ""))
      } catch (e) {
        // Ignore invalid JSON
      }
    })

    // Extract main content using a basic readability algorithm
    let content = ""
    let textContent = ""

    try {
      const { Readability } = require("@mozilla/readability")
      const reader = new Readability(dom.window.document)
      const article = reader.parse()

      if (article) {
        content = article.content
        textContent = article.textContent
      }
    } catch (error) {
      // Fallback to body content if readability fails
      content = document.body.innerHTML
      textContent = document.body.textContent || ""
    }

    // Calculate word count and reading time
    const wordCount = textContent.split(/\s+/).filter(Boolean).length
    const readingTime = Math.ceil(wordCount / 200) // Assuming 200 words per minute

    // Check for key quality indicators
    const hasAuthorInfo = !!author
    const hasDates = !!datePublished
    const hasReferences = document.querySelectorAll('a[href^="http"]').length > 0
    const hasSchema = structuredData.length > 0

    return {
      title,
      description,
      content,
      textContent,
      headings,
      links,
      images,
      author,
      datePublished,
      structuredData,
      wordCount,
      readingTime,
      hasAuthorInfo,
      hasDates,
      hasReferences,
      hasSchema,
    }
  } catch (error) {
    console.error("Error scraping webpage:", error)
    throw new Error(`Failed to scrape webpage: ${error.message}`)
  }
}

