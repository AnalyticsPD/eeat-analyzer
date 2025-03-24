import puppeteer from "puppeteer-core"
import chromium from "chrome-aws-lambda"
import * as cheerio from "cheerio"
import { Readability } from "@mozilla/readability"
import { JSDOM } from "jsdom"
import { convert } from "html-to-text"

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
  screenshot: string
  wordCount: number
  readingTime: number
  hasAuthorInfo: boolean
  hasDates: boolean
  hasReferences: boolean
  hasSchema: boolean
}

export async function scrapeWebpage(url: string): Promise<ScrapedData> {
  let browser

  try {
    // Launch browser
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: true,
    })

    const page = await browser.newPage()

    // Set viewport for consistent screenshots
    await page.setViewport({ width: 1280, height: 800 })

    // Navigate to the URL
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 })

    // Take a screenshot
    const screenshot = await page.screenshot({ encoding: "base64" })

    // Get the HTML content
    const html = await page.content()

    // Extract structured data
    const structuredData = await page.evaluate(() => {
      const elements = document.querySelectorAll('script[type="application/ld+json"]')
      const data = []
      elements.forEach((el) => {
        try {
          data.push(JSON.parse(el.textContent || ""))
        } catch (e) {
          // Ignore invalid JSON
        }
      })
      return data
    })

    // Extract content using Readability
    const dom = new JSDOM(html, { url })
    const reader = new Readability(dom.window.document)
    const article = reader.parse()

    // Use cheerio for additional parsing
    const $ = cheerio.load(html)

    // Extract headings
    const headings: string[] = []
    $("h1, h2, h3, h4, h5, h6").each((_, el) => {
      headings.push($(el).text().trim())
    })

    // Extract links
    const links: { text: string; url: string }[] = []
    $("a").each((_, el) => {
      const href = $(el).attr("href")
      if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
        links.push({
          text: $(el).text().trim(),
          url: href,
        })
      }
    })

    // Extract images
    const images: { alt: string; src: string }[] = []
    $("img").each((_, el) => {
      const src = $(el).attr("src")
      if (src) {
        images.push({
          alt: $(el).attr("alt") || "",
          src,
        })
      }
    })

    // Extract author information
    let author = ""

    // Try common author selectors
    const authorSelectors = [
      'meta[name="author"]',
      'meta[property="article:author"]',
      ".author",
      ".byline",
      '[rel="author"]',
      '[itemprop="author"]',
    ]

    for (const selector of authorSelectors) {
      if ($(selector).length) {
        const el = $(selector)
        if (el.attr("content")) {
          author = el.attr("content") || ""
        } else {
          author = el.text().trim()
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
      if ($(selector).length) {
        const el = $(selector)
        if (el.attr("content")) {
          datePublished = el.attr("content") || ""
        } else if (el.attr("datetime")) {
          datePublished = el.attr("datetime") || ""
        } else {
          datePublished = el.text().trim()
        }
        if (datePublished) break
      }
    }

    // Convert HTML to plain text for analysis
    const textContent = convert(article?.content || html, {
      wordwrap: false,
      selectors: [
        { selector: "a", options: { ignoreHref: true } },
        { selector: "img", format: "skip" },
      ],
    })

    // Calculate word count and reading time
    const wordCount = textContent.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200) // Assuming 200 words per minute

    // Check for key quality indicators
    const hasAuthorInfo = !!author
    const hasDates = !!datePublished
    const hasReferences = $('a[href^="http"]').length > 0
    const hasSchema = structuredData.length > 0

    return {
      title: article?.title || $("title").text().trim(),
      description: $('meta[name="description"]').attr("content") || "",
      content: article?.content || html,
      textContent,
      headings,
      links,
      images,
      author,
      datePublished,
      structuredData,
      screenshot: `data:image/png;base64,${screenshot}`,
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
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

