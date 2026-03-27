/**
 * Forex News Client
 * Fetches news headlines from free RSS feeds (DailyFX, Investing.com).
 * Falls back gracefully if feeds are unavailable.
 */

export interface NewsHeadline {
    title: string
    source: string
    url: string
    time: string
    impact?: 'High' | 'Medium' | 'Low'
}

const RSS_FEEDS = [
    {
        url: 'https://www.dailyfx.com/feeds/forex',
        source: 'DailyFX',
    },
    {
        url: 'https://www.investing.com/rss/news_14.rss',
        source: 'Investing.com',
    },
]

/**
 * Fetch recent forex news headlines from RSS feeds.
 * Parses RSS XML manually (no external XML library needed).
 */
export async function fetchForexNews(limit: number = 10): Promise<NewsHeadline[]> {
    const allHeadlines: NewsHeadline[] = []

    const results = await Promise.allSettled(
        RSS_FEEDS.map(feed => fetchRSSFeed(feed.url, feed.source))
    )

    for (const result of results) {
        if (result.status === 'fulfilled') {
            allHeadlines.push(...result.value)
        }
    }

    // Sort by time (newest first) and limit
    allHeadlines.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    return allHeadlines.slice(0, limit)
}

async function fetchRSSFeed(url: string, source: string): Promise<NewsHeadline[]> {
    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            next: { revalidate: 1800 }, // 30 min cache
            signal: AbortSignal.timeout(10_000),
        })

        if (!response.ok) return []

        const xml = await response.text()
        return parseRSSItems(xml, source)
    } catch {
        return []
    }
}

/**
 * Simple RSS XML parser — extracts <item> elements without an XML library.
 */
function parseRSSItems(xml: string, source: string): NewsHeadline[] {
    const headlines: NewsHeadline[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi
    let match

    while ((match = itemRegex.exec(xml)) !== null) {
        const item = match[1]
        const title = extractTag(item, 'title')
        const link = extractTag(item, 'link')
        const pubDate = extractTag(item, 'pubDate')

        if (title && link) {
            headlines.push({
                title: decodeEntities(title),
                source,
                url: link,
                time: pubDate || new Date().toISOString(),
            })
        }
    }

    return headlines
}

function extractTag(xml: string, tag: string): string | null {
    // Handle CDATA sections
    const cdataRegex = new RegExp(`<${tag}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i')
    const cdataMatch = xml.match(cdataRegex)
    if (cdataMatch) return cdataMatch[1].trim()

    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
    const m = xml.match(regex)
    return m ? m[1].trim() : null
}

function decodeEntities(str: string): string {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
}
