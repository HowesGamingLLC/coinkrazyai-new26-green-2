import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { query } from '../db/connection';

export interface CrawledGame {
  title: string;
  provider: string;
  rtp: number;
  volatility: 'Low' | 'Medium' | 'High';
  description: string;
  image_url?: string;
  thumbnail_url?: string;
  embed_url?: string;
  launch_url?: string;
  max_paylines?: number;
  reels?: number;
  rows?: number;
  min_bet?: number;
  max_bet?: number;
  max_win?: string;
  release_date?: string;
  features?: string[];
  theme?: string;
  type?: string;
  source: string;
  raw_html?: string;
}

export interface CrawlResult {
  success: boolean;
  game?: any;
  message: string;
  error?: string;
  crawledData?: CrawledGame;
}

interface CrawlerConfig {
  timeout: number;
  maxRetries: number;
  headers: Record<string, string>;
}

const DEFAULT_CRAWLER_CONFIG: CrawlerConfig = {
  timeout: 15000,
  maxRetries: 2,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
  },
};

class GameCrawler {
  private config: CrawlerConfig;

  constructor(config: Partial<CrawlerConfig> = {}) {
    this.config = { ...DEFAULT_CRAWLER_CONFIG, ...config };
  }

  /**
   * Extract game data from HTML content using multiple parsing strategies
   */
  private extractGameData(html: string, url: string): CrawledGame | null {
    try {
      console.log(`[Crawler] Starting extraction for ${url}`);
      const $ = cheerio.load(html);

      // Check if this is a list page instead of a game page
      if (this.isListPage($, html)) {
        console.log(`[Crawler] Detected list page at ${url}`);
        return null; // crawlMultiple will handle link extraction if needed
      }

      // Extract title from multiple possible locations
      let title = this.extractTitle(html, $);
      console.log(`[Crawler] Extracted title: "${title}"`);

      // Extract RTP from various patterns
      const rtp = this.extractRTP(html, $);
      console.log(`[Crawler] Extracted RTP: ${rtp}`);

      // Extract volatility
      const volatility = this.extractVolatility(html, $);
      console.log(`[Crawler] Extracted Volatility: ${volatility}`);

      // Extract description
      const description = this.extractDescription(html, $);
      console.log(`[Crawler] Extracted Description length: ${description.length}`);

      // Extract image URL
      const image_url = this.extractImageUrl(html, $, url);
      console.log(`[Crawler] Extracted Image URL: ${image_url || 'None'}`);

      const thumbnail_url = this.extractThumbnailUrl(html, $, url);
      console.log(`[Crawler] Extracted Thumbnail URL: ${thumbnail_url || 'None'}`);

      // Extract embed URL (iframe or demo link)
      let embed_url = this.extractEmbedUrl(html, $, url);
      console.log(`[Crawler] Extracted Embed URL: ${embed_url || 'None'}`);

      // Force include embed/iframe URL if not found
      if (!embed_url) {
        console.log(`[Crawler] No embed found, forcing source URL as embed/launch URL: ${url}`);
        embed_url = url;
      }

      // Extract launch URL (force launch_url for all)
      const launch_url = embed_url;
      console.log(`[Crawler] Set Launch URL (forced): ${launch_url}`);

      // Extract additional data
      const max_paylines = this.extractPaylines(html, $);
      const reels = this.extractReels(html, $);
      const rows = this.extractRows(html, $);
      const min_bet = this.extractMinBet(html, $);
      const max_bet = this.extractMaxBet(html, $);
      const max_win = this.extractMaxWin(html, $);
      const release_date = this.extractReleaseDate(html, $);
      const features = this.extractFeatures(html, $);
      const theme = this.extractTheme(html, $);
      const type = this.extractType(html, $);

      if (!title || title.length < 2) {
        console.warn(`[Crawler] Could not extract valid title from ${url}. HTML might be empty or obfuscated.`);
        return null;
      }

      const provider = this.guessProvider(title, html);

      return {
        title: title.substring(0, 250),
        provider: provider,
        rtp,
        volatility,
        description: description.substring(0, 500),
        image_url,
        thumbnail_url,
        embed_url,
        launch_url,
        max_paylines,
        reels,
        rows,
        min_bet,
        max_bet,
        max_win,
        release_date,
        features,
        theme,
        type,
        source: url,
      };
    } catch (error) {
      console.error(`[Crawler] Error parsing HTML: ${(error as Error).message}`);
      return null;
    }
  }

  private isListPage($: cheerio.CheerioAPI, html: string): boolean {
    // List pages usually have many game links and lack specific game details like RTP in a header
    const gameLinkCount = $('a[href*="/slots/"], a[href*="/game/"]').length;
    const hasRTPHeader = html.includes('RTP') && (html.includes('%') || html.includes('Return to Player'));

    // If there are many game links and no clear single game title/RTP area, it's likely a list
    if (gameLinkCount > 10 && !$('h1').text().toLowerCase().includes('slot review')) {
      return true;
    }

    return false;
  }

  public extractLinks(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const links: string[] = [];
    const urlObj = new URL(baseUrl);

    // Look for links that look like game pages
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;

      try {
        const absoluteUrl = new URL(href, urlObj.origin).toString();

        // Filter for URLs that likely point to games
        if (
          (absoluteUrl.includes('/slots/') || absoluteUrl.includes('/game/')) &&
          !absoluteUrl.includes('/en/The-Best-Slots') && // Avoid the list page itself
          !links.includes(absoluteUrl) &&
          absoluteUrl.startsWith(urlObj.origin)
        ) {
          links.push(absoluteUrl);
        }
      } catch (e) {}
    });

    return links.slice(0, 20); // Limit to first 20 games to avoid overloading
  }

  private extractTitle(html: string, $: cheerio.CheerioAPI): string {
    // Try various title extraction methods
    let title = '';

    // SlotCatalog specific
    const scTitle = $('.game-header h1, .slot-header h1').first().text().trim();
    if (scTitle) title = scTitle;

    if (!title) {
      // Try specific game title elements
      title = $('.game-title').first().text().trim() ||
              $('.slot-title').first().text().trim() ||
              $('.entry-title').first().text().trim() ||
              $('h1').first().text().trim();
    }

    if (!title || title.toLowerCase().includes('just a moment')) {
      title = $('title').text().trim();
    }

    if (!title) {
      const ogTitle = $('meta[property="og:title"]').attr('content');
      if (ogTitle) title = ogTitle.trim();
    }

    if (!title) {
      // Fallback to meta name title
      const metaTitle = $('meta[name="title"]').attr('content');
      if (metaTitle) title = metaTitle.trim();
    }

    if (!title) {
      // Try to find in script tags (common for single-page apps or games)
      const scriptMatch = html.match(/game_name\s*=\s*["']([^"']+)["']/i) ||
                          html.match(/gameName\s*=\s*["']([^"']+)["']/i) ||
                          html.match(/title\s*:\s*["']([^"']+)["']/i);
      if (scriptMatch) title = scriptMatch[1].trim();
    }

    // Clean up common suffixes and prefixes
    title = title
      .replace(/Slot Review/i, '')
      .replace(/Demo Slot/i, '')
      .replace(/Play for Free/i, '')
      .replace(/Online Slot/i, '')
      .replace(/Slot Free Play/i, '')
      .replace(/Review & Demo/i, '')
      .replace(/ - [^-|:]+$/i, '') // Remove last part after dash if it looks like a site name
      .split('|')[0]
      .split('-')[0]
      .split(':')[0]
      .trim();

    // Remove provider names if they are in parentheses like "Sweet Bonanza (Pragmatic Play)"
    title = title.replace(/\s*\([^)]+\)$/, '').trim();

    return title;
  }

  private extractRTP(html: string, $: cheerio.CheerioAPI): number {
    // Try to find in SlotCatalog specific tables
    const scRTP = $('td:contains("RTP"), span:contains("RTP")').next().text().trim();
    if (scRTP) {
      const match = scRTP.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > 0 && val <= 100) return val;
      }
    }

    // Multiple regex patterns for RTP extraction
    const patterns = [
      /RTP[:\s]+(\d{2,3}(?:\.\d{1,2})?)%/i,
      /(\d{2,3}(?:\.\d{1,2})?)%[\s]*RTP/i,
      /payout[\s]+percentage[:\s]+(\d{2,3}(?:\.\d{1,2})?)%/i,
      /return[\s]+to[\s]+player[:\s]+(\d{2,3}(?:\.\d{1,2})?)%/i,
      /Theoretical[\s]+Return[:\s]+(\d{2,3}(?:\.\d{1,2})?)%/i,
      /Expected[\s]+Payback[:\s]+(\d{2,3}(?:\.\d{1,2})?)%/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        const rtp = parseFloat(match[1]);
        if (!isNaN(rtp) && rtp > 0 && rtp <= 100) {
          return rtp;
        }
      }
    }

    // Try to find in specific data attributes or JSON
    const jsonMatch = html.match(/"rtp"\s*:\s*(\d{2,3}(?:\.\d{1,2})?)/i);
    if (jsonMatch) {
      const rtp = parseFloat(jsonMatch[1]);
      if (!isNaN(rtp) && rtp > 0 && rtp <= 100) {
        return rtp;
      }
    }

    // Default to 95.0 if not found
    return 95.0;
  }

  private extractVolatility(html: string, $: cheerio.CheerioAPI): 'Low' | 'Medium' | 'High' {
    // SlotCatalog specific
    const scVol = $('td:contains("Volatility"), span:contains("Volatility")').next().text().trim().toLowerCase();
    if (scVol) {
      if (scVol.includes('low')) return 'Low';
      if (scVol.includes('high')) return 'High';
      if (scVol.includes('med')) return 'Medium';
    }

    const patterns = [
      /(Low|Medium|High)[\s]+Volatility/i,
      /Volatility[:\s]+(Low|Medium|High)/i,
      /Variance[:\s]+(Low|Medium|High)/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        const vol = match[1].toLowerCase();
        if (vol === 'low' || vol === 'medium' || vol === 'high') {
          return vol.charAt(0).toUpperCase() + vol.slice(1) as 'Low' | 'Medium' | 'High';
        }
      }
    }

    // Check JSON data
    const jsonMatch = html.match(/"volatility"\s*:\s*"([^"]+)"/i);
    if (jsonMatch && ['Low', 'Medium', 'High'].includes(jsonMatch[1])) {
      return jsonMatch[1] as 'Low' | 'Medium' | 'High';
    }

    return 'Medium';
  }

  private extractDescription(html: string, $: cheerio.CheerioAPI): string {
    // Try OG description
    let description = $('meta[property="og:description"]').attr('content')?.trim();

    if (!description) {
      description = $('meta[name="description"]').attr('content')?.trim();
    }

    if (!description) {
      // Try to extract from first paragraph
      description = $('p').first().text().trim();
    }

    if (!description) {
      // Try common content areas
      description = $('.description').first().text().trim() ||
                   $('.game-info').first().text().trim() ||
                   $('[role="main"]').first().text().substring(0, 500).trim();
    }

    // Try to find in scripts
    if (description === 'Game details not available') {
      const scriptMatch = html.match(/description\s*:\s*["']([^"']{20,})["']/i);
      if (scriptMatch) description = scriptMatch[1].trim();
    }

    return description || 'Game details not available';
  }

  private extractImageUrl(html: string, $: cheerio.CheerioAPI, baseUrl: string): string | undefined {
    // SlotCatalog specific
    let imageUrl = $('.game-img-wrapper img, .slot-img-wrapper img').first().attr('src') ||
                   $('img[src*="/games/"]').first().attr('src');

    if (!imageUrl) {
      // Try OG image first
      imageUrl = $('meta[property="og:image"]').attr('content');
    }

    if (!imageUrl) {
      imageUrl = $('meta[name="image"]').attr('content');
    }

    if (!imageUrl) {
      // Try to find game image in common locations - prioritize high quality/large images
      imageUrl = $('img.game-header-image').first().attr('src') ||
                $('img.game-hero-image').first().attr('src') ||
                $('img.featured-image').first().attr('src') ||
                $('img.game-image').first().attr('src') ||
                $('img[src*="logo"]').first().attr('src') ||
                $('img[alt*="logo"]').first().attr('src') ||
                $('img[alt*="game"]').first().attr('src') ||
                $('img[alt*="slot"]').first().attr('src') ||
                $('picture img').first().attr('src');
    }

    if (imageUrl && !imageUrl.startsWith('http')) {
      try {
        const urlObj = new URL(baseUrl);
        imageUrl = new URL(imageUrl, urlObj.origin).toString();
      } catch (e) {
        // Fallback
      }
    }

    return imageUrl;
  }

  private extractThumbnailUrl(html: string, $: cheerio.CheerioAPI, baseUrl: string): string | undefined {
    // Look for smaller images or explicitly labeled thumbnails
    let thumbUrl = $('link[rel="icon"]').attr('href') ||
                   $('link[rel="apple-touch-icon"]').attr('href');

    if (!thumbUrl) {
      thumbUrl = $('img[src*="thumb"]').first().attr('src') ||
                 $('img[class*="thumb"]').first().attr('src') ||
                 $('img[id*="thumb"]').first().attr('src') ||
                 $('.thumbnail img').first().attr('src');
    }

    if (thumbUrl && !thumbUrl.startsWith('http')) {
      try {
        const urlObj = new URL(baseUrl);
        thumbUrl = new URL(thumbUrl, urlObj.origin).toString();
      } catch (e) {
        // Fallback
      }
    }

    return thumbUrl;
  }

  private extractEmbedUrl(html: string, $: cheerio.CheerioAPI, baseUrl: string): string | undefined {
    // 1. Look for iframes with various sources or data attributes
    let iframeSrc = $('iframe[src*="demo"]').first().attr('src') ||
                    $('iframe[src*="game"]').first().attr('src') ||
                    $('iframe[src*="play"]').first().attr('src') ||
                    $('iframe[src*="launcher"]').first().attr('src') ||
                    $('iframe#game-iframe').attr('src') ||
                    $('iframe#game_frame').attr('src') ||
                    $('iframe.game-iframe').attr('src') ||
                    $('iframe[data-src*="demo"]').first().attr('data-src') ||
                    $('iframe[data-url*="demo"]').first().attr('data-url');

    // 2. If no matching iframe found, and there is exactly one iframe on the page, take it (excluding ads/social)
    if (!iframeSrc) {
      const allIframes = $('iframe').filter((_, el) => {
        const src = $(el).attr('src') || '';
        const id = $(el).attr('id') || '';
        const className = $(el).attr('class') || '';
        const combined = (src + id + className).toLowerCase();

        // Exclude common third-party non-game iframes
        return !combined.includes('google') &&
               !combined.includes('facebook') &&
               !combined.includes('twitter') &&
               !combined.includes('ads') &&
               !combined.includes('analytics') &&
               !combined.includes('disqus') &&
               !combined.includes('recaptcha') &&
               src.length > 5;
      });

      if (allIframes.length === 1) {
        iframeSrc = allIframes.first().attr('src');
      }
    }

    if (iframeSrc) {
      if (iframeSrc.startsWith('//')) {
        return `https:${iframeSrc}`;
      }
      if (!iframeSrc.startsWith('http')) {
        try {
          const urlObj = new URL(baseUrl);
          return new URL(iframeSrc, urlObj.origin).toString();
        } catch (e) {}
      }
      return iframeSrc;
    }

    // 3. Look for "Play Demo" or "Play for Free" buttons/links with various text and attributes
    const demoSelectors = [
      'a:contains("Play Demo")',
      'a:contains("Demo")',
      'a:contains("Play for Free")',
      'a:contains("Free Play")',
      'a:contains("Play Now")',
      'a:contains("Launch")',
      'button[data-demo-url]',
      'button[data-game-url]',
      'div[data-game-url]',
      'div[data-demo-url]',
      'a.play-demo',
      'a.demo-button',
      'a.btn-play'
    ];

    let demoLink: string | undefined;
    for (const selector of demoSelectors) {
      const el = $(selector);
      demoLink = el.attr('href') || el.attr('data-demo-url') || el.attr('data-game-url');
      if (demoLink && demoLink.length > 5 && !demoLink.startsWith('#') && !demoLink.startsWith('javascript:')) {
        break;
      }
      demoLink = undefined;
    }

    if (demoLink) {
      if (demoLink.startsWith('//')) {
        return `https:${demoLink}`;
      }
      if (!demoLink.startsWith('http')) {
        try {
          const urlObj = new URL(baseUrl);
          return new URL(demoLink, urlObj.origin).toString();
        } catch (e) {}
      }
      return demoLink;
    }

    // 4. Final attempt: search for direct game provider URLs in the entire HTML
    const providerPatterns = [
      /https?:\/\/demogamesfree\.pragmaticplay\.net\/[^"']+/i,
      /https?:\/\/released\.playngonetwork\.com\/[^"']+/i,
      /https?:\/\/static-stage\.contentmedia\.eu\/[^"']+/i,
      /https?:\/\/democasino\.betsoftgaming\.com\/[^"']+/i,
      /https?:\/\/playin\.com\/embed\/[^"']+/i
    ];

    for (const pattern of providerPatterns) {
      const match = html.match(pattern);
      if (match) return match[0];
    }

    return undefined;
  }

  private extractPaylines(html: string, $: cheerio.CheerioAPI): number | undefined {
    const patterns = [
      /(\d+)[\s]+paylines?/i,
      /Paylines?[:\s]+(\d+)/i,
      /lines?[:\s]+(\d+)/i,
      /ways[\s]+to[\s]+win[:\s]+(\d+)/i,
      /(\d+)[\s]+ways[\s]+to[\s]+win/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        const paylines = parseInt(match[1]);
        if (!isNaN(paylines) && paylines > 0 && paylines <= 1000000) {
          return paylines;
        }
      }
    }

    return undefined;
  }

  private extractReels(html: string, $: cheerio.CheerioAPI): number | undefined {
    const patterns = [
      /Reels?[:\s]+(\d+)/i,
      /(\d+)[\s]+reels?/i,
      /Layout[:\s]+(\d+)x\d+/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        const val = parseInt(match[1]);
        if (!isNaN(val) && val > 0 && val < 20) return val;
      }
    }
    return undefined;
  }

  private extractRows(html: string, $: cheerio.CheerioAPI): number | undefined {
    const patterns = [
      /Rows?[:\s]+(\d+)/i,
      /(\d+)[\s]+rows?/i,
      /Layout[:\s]+\d+x(\d+)/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        const val = parseInt(match[1]);
        if (!isNaN(val) && val > 0 && val < 20) return val;
      }
    }
    return undefined;
  }

  private extractMinBet(html: string, $: cheerio.CheerioAPI): number | undefined {
    const patterns = [
      /Min[\s]+bet[:\s]+(?:[$€£])?(\d+(?:\.\d+)?)/i,
      /Minimum[\s]+bet[:\s]+(?:[$€£])?(\d+(?:\.\d+)?)/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return parseFloat(match[1]);
    }
    return undefined;
  }

  private extractMaxBet(html: string, $: cheerio.CheerioAPI): number | undefined {
    const patterns = [
      /Max[\s]+bet[:\s]+(?:[$€£])?(\d+(?:\.\d+)?)/i,
      /Maximum[\s]+bet[:\s]+(?:[$€£])?(\d+(?:\.\d+)?)/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return parseFloat(match[1]);
    }
    return undefined;
  }

  private extractMaxWin(html: string, $: cheerio.CheerioAPI): string | undefined {
    const patterns = [
      /Max[\s]+win[:\s]+([\d,]+x?)/i,
      /Maximum[\s]+win[:\s]+([\d,]+x?)/i,
      /Max[\s]+payout[:\s]+([\d,]+x?)/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[1];
    }
    return undefined;
  }

  private extractFeatures(html: string, $: cheerio.CheerioAPI): string[] | undefined {
    const features: string[] = [];
    const keywords = [
      'Free Spins', 'Bonus Round', 'Multipliers', 'Wilds', 'Scatters',
      'Expanding Wilds', 'Sticky Wilds', 'Cascading Reels', 'Megaways',
      'Jackpot', 'Gamble Feature', 'Buy Feature', 'Re-Spins', 'Tumbling Reels',
      'Avalanche', 'Pick and Click', 'Bonus Game', 'Cluster Pays', 'Pay Anywhere'
    ];

    for (const keyword of keywords) {
      const regex = new RegExp(keyword, 'i');
      if (regex.test(html)) {
        features.push(keyword);
      }
    }

    // Try to extract more features from specific lists if they exist
    $('.game-features li, .features-list li, .slot-features li').each((_, el) => {
      const feature = $(el).text().trim();
      if (feature && !features.includes(feature) && feature.length < 50) {
        features.push(feature);
      }
    });

    return features.length > 0 ? features : undefined;
  }

  private extractTheme(html: string, $: cheerio.CheerioAPI): string | undefined {
    const patterns = [
      /Theme[:\s]+([^<\n,]+)/i,
      /Genre[:\s]+([^<\n,]+)/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[1].trim();
    }
    return undefined;
  }

  private extractType(html: string, $: cheerio.CheerioAPI): string | undefined {
    // Try SlotCatalog specific layout
    const scType = $('td:contains("Game Type"), span:contains("Game Type")').next().text().trim();
    if (scType) return scType;

    const patterns = [
      /Game[\s]+Type[:\s]+([^<\n,]+)/i,
      /Type[:\s]+(Video Slot|Classic Slot|3D Slot|Mobile Slot|Progressive Slot)/i,
      /(Video Slot|Classic Slot|3D Slot|Mobile Slot|Progressive Slot)/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[1].trim();
    }

    // Heuristics based on features
    if (html.toLowerCase().includes('megaways')) return 'Megaways Slot';
    if (html.toLowerCase().includes('3-reel') || html.toLowerCase().includes('three-reel')) return 'Classic Slot';

    return 'Video Slot'; // Default for most modern games
  }

  private extractReleaseDate(html: string, $: cheerio.CheerioAPI): string | undefined {
    const patterns = [
      /Released?[:\s]+(\d{1,2}[\s-/]\d{1,2}[\s-/]\d{4})/i,
      /Release[\s]+Date[:\s]+(\d{1,2}[\s-/]\d{1,2}[\s-/]\d{4})/i,
      /Published?[:\s]+(\d{1,2}[\s-/]\d{1,2}[\s-/]\d{4})/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }

  private guessProvider(title: string, html: string): string {
    const commonProviders: Record<string, RegExp> = {
      'Pragmatic Play': /pragmatic[\s]play|pragmaticplay/i,
      'Microgaming': /microgaming/i,
      'NetEnt': /netent/i,
      'Nolimit City': /nolimit|no limit/i,
      'Hacksaw Gaming': /hacksaw/i,
      'Relax Gaming': /relax gaming/i,
      'IGT': /igt|wagerworks/i,
      'WMS': /wms|williams/i,
      'Playtech': /playtech/i,
      'Bally': /bally/i,
      'Play\'n GO': /playngo|play n go/i,
      'Betsoft': /betsoft/i,
      'Red Tiger': /red tiger|redtiger/i,
      'Quickspin': /quickspin/i,
      'Yggdrasil': /yggdrasil/i,
      'ELK Studios': /elk studios|elk/i,
      'Push Gaming': /push gaming/i,
      'Evolution': /evolution/i,
      'Blueprint': /blueprint/i,
      'Big Time Gaming': /btg|big time/i,
      'PG Soft': /pg soft|pgsoft/i,
      'CT Interactive': /ct interactive|ctinteractive/i,
      'EGT': /egt|amusnet/i,
    };

    // Check title first
    for (const [provider, regex] of Object.entries(commonProviders)) {
      if (regex.test(title)) {
        return provider;
      }
    }

    // Check HTML content if not found in title
    for (const [provider, regex] of Object.entries(commonProviders)) {
      if (regex.test(html.substring(0, 10000))) { // Search first 10KB
        return provider;
      }
    }

    return 'Other';
  }

  /**
   * Fetch HTML from a URL with retry logic and proper error handling
   */
  private async fetchHtml(url: string, retryCount = 0): Promise<string> {
    try {
      console.log(`[Crawler] Fetching: ${url} (Attempt ${retryCount + 1}/${this.config.maxRetries + 1})`);

      const headers = { ...this.config.headers };

      // Add referer if it's a sub-page
      if (url.includes('/slots/') || url.includes('/game/')) {
        try {
          const urlObj = new URL(url);
          headers['Referer'] = urlObj.origin + '/';
        } catch (e) {}
      }

      const response = await axios.get(url, {
        headers,
        timeout: this.config.timeout,
        maxRedirects: 10,
        validateStatus: (status) => status < 500,
      });

      if (response.status === 200) {
        console.log(`[Crawler] Successfully fetched: ${url}`);
        return response.data;
      }

      if (response.status === 429) {
        // Rate limited - wait and retry
        if (retryCount < this.config.maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          console.log(`[Crawler] Rate limited. Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.fetchHtml(url, retryCount + 1);
        }
        throw new Error('Too many requests (429) - rate limited');
      }

      if (response.status === 403 || response.status === 401) {
        throw new Error(`Access denied (${response.status}) - site may be blocking automated access`);
      }

      if (response.status >= 400) {
        throw new Error(`Server returned status ${response.status}`);
      }

      throw new Error(`Unexpected status: ${response.status}`);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.code === 'ECONNABORTED') {
        throw new Error('Request timeout - site took too long to respond');
      }

      if (axiosError.code === 'ECONNREFUSED') {
        throw new Error('Connection refused - site may be unavailable');
      }

      if (axiosError.code === 'ERR_TLS_CERT_AUTH_FAILURE') {
        throw new Error('SSL certificate verification failed');
      }

      if (axiosError.message?.includes('ENOTFOUND')) {
        throw new Error('Domain not found - invalid URL');
      }

      throw error;
    }
  }

  /**
   * Crawl a single URL and extract game data
   */
  async crawlUrl(url: string): Promise<CrawledGame | null> {
    try {
      const html = await this.fetchHtml(url);
      const gameData = this.extractGameData(html, url);

      if (gameData) {
        console.log(`[Crawler] Extracted game: ${gameData.title}`);
      }

      return gameData;
    } catch (error) {
      console.error(`[Crawler] Error crawling ${url}:`, (error as Error).message);
      return null;
    }
  }

  /**
   * Crawl multiple URLs and aggregate results
   */
  async crawlMultiple(urls: string[]): Promise<{ games: CrawledGame[]; errors: { url: string; error: string }[] }> {
    const games: CrawledGame[] = [];
    const errors: { url: string; error: string }[] = [];
    const urlsToProcess = [...urls];
    const processedUrls = new Set<string>();

    while (urlsToProcess.length > 0 && games.length < 50) {
      const url = urlsToProcess.shift()!;
      if (processedUrls.has(url)) continue;
      processedUrls.add(url);

      try {
        // Add a small delay between requests to be polite and avoid rate limits
        if (processedUrls.size > 1) {
          const delay = 500 + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const html = await this.fetchHtml(url);
        const $ = cheerio.load(html);

        if (this.isListPage($, html)) {
          console.log(`[Crawler] Processing list page: ${url}`);
          const discoveredLinks = this.extractLinks(html, url);
          console.log(`[Crawler] Found ${discoveredLinks.length} links on list page`);

          // Add discovered links to the queue if we haven't seen them
          for (const link of discoveredLinks) {
            if (!processedUrls.has(link)) {
              urlsToProcess.push(link);
            }
          }
          continue; // Move to next URL in queue
        }

        const gameData = this.extractGameData(html, url);
        if (gameData) {
          games.push(gameData);
        } else {
          errors.push({ url, error: 'Failed to extract valid game data from the HTML structure' });
        }
      } catch (error) {
        console.error(`[Crawler] Failed to process ${url}:`, (error as Error).message);
        errors.push({ url, error: (error as Error).message });
      }
    }

    console.log(`[Crawler] Successfully crawled ${games.length} games. Total URLs processed: ${processedUrls.size}`);
    return { games, errors };
  }

  /**
   * Validate crawled game data
   */
  validateGameData(game: CrawledGame): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!game.title || game.title.length < 2) {
      errors.push('Title is too short or missing');
    }

    if (isNaN(game.rtp) || game.rtp < 50 || game.rtp > 100) {
      errors.push(`Invalid RTP: ${game.rtp}`);
    }

    if (!['Low', 'Medium', 'High'].includes(game.volatility)) {
      errors.push(`Invalid volatility: ${game.volatility}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Save crawled game to database
   */
  async saveGame(gameData: CrawledGame): Promise<any> {
    const validation = this.validateGameData(gameData);

    if (!validation.valid) {
      console.error(`[Crawler] Validation failed for ${gameData.title}:`, validation.errors.join(', '));
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      // Check if game already exists
      const existingGameResult = await query(
        'SELECT id, image_url, thumbnail, embed_url, launch_url, description FROM games WHERE name = $1 AND provider = $2',
        [gameData.title, gameData.provider]
      );

      let savedGame;

      if (existingGameResult.rows.length > 0) {
        console.log(`[Crawler] Game already exists: ${gameData.title}. Updating missing details.`);
        const existing = existingGameResult.rows[0];

        // Update existing game if fields are missing
        const updates = [];
        const values = [];
        let i = 1;

        if (!existing.image_url && gameData.image_url) {
          updates.push(`image_url = $${i++}`);
          values.push(gameData.image_url);
        }
        if (!existing.thumbnail && gameData.thumbnail_url) {
          updates.push(`thumbnail = $${i++}`);
          values.push(gameData.thumbnail_url);
        }
        if (!existing.embed_url && gameData.embed_url) {
          updates.push(`embed_url = $${i++}`);
          values.push(gameData.embed_url);
        }
        if (!existing.launch_url && gameData.launch_url) {
          updates.push(`launch_url = $${i++}`);
          values.push(gameData.launch_url);
        }
        if ((!existing.description || existing.description.length < 50) && gameData.description) {
          updates.push(`description = $${i++}`);
          values.push(gameData.description);
        }
        if (!existing.type && gameData.type) {
          updates.push(`type = $${i++}`);
          values.push(gameData.type);
        }

        if (updates.length > 0) {
          values.push(existing.id);
          const updateSql = `UPDATE games SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${i} RETURNING *`;
          const updateResult = await query(updateSql, values);
          savedGame = updateResult.rows[0];
        } else {
          savedGame = existing;
        }
      } else {
        // Insert new game
        const slug = gameData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        const result = await query(
          `INSERT INTO games (name, slug, category, type, provider, rtp, volatility, description, image_url, thumbnail, embed_url, launch_url, enabled)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
           RETURNING *`,
          [
            gameData.title,
            slug,
            'Slots',
            gameData.type || 'Video Slot',
            gameData.provider,
            gameData.rtp,
            gameData.volatility,
            gameData.description,
            gameData.image_url,
            gameData.thumbnail_url,
            gameData.embed_url,
            gameData.launch_url
          ]
        );

        savedGame = result.rows[0];
      }

      // Store additional metadata in game_config
      const configEntries = [
        { key: 'max_paylines', value: gameData.max_paylines },
        { key: 'reels', value: gameData.reels },
        { key: 'rows', value: gameData.rows },
        { key: 'min_bet', value: gameData.min_bet },
        { key: 'max_bet', value: gameData.max_bet },
        { key: 'max_win', value: gameData.max_win },
        { key: 'release_date', value: gameData.release_date },
        { key: 'features', value: gameData.features },
        { key: 'theme', value: gameData.theme },
        { key: 'crawl_source_url', value: gameData.source }
      ];

      for (const entry of configEntries) {
        if (entry.value !== undefined) {
          await query(
            'INSERT INTO game_config (game_id, config_key, config_value) VALUES ($1, $2, $3) ON CONFLICT (game_id, config_key) DO UPDATE SET config_value = $3',
            [savedGame.id, entry.key, JSON.stringify(entry.value)]
          );
        }
      }

      console.log(`[Crawler] Processed game: ${gameData.title} (ID: ${savedGame.id})`);

      // Ensure game_compliance is configured for seamless SC wallet (sweepstakes mode)
      try {
        await query(
          `INSERT INTO game_compliance (game_id, is_external, is_sweepstake, is_social_casino, currency, max_win_amount, min_bet, max_bet)
           VALUES ($1, true, true, true, 'SC', 20.00, 0.01, 5.00)
           ON CONFLICT (game_id) DO UPDATE SET
              is_external = true,
              is_sweepstake = true,
              is_social_casino = true,
              currency = 'SC'`,
          [savedGame.id]
        );
        console.log(`[Crawler] Configured seamless SC wallet for game: ${savedGame.name}`);
      } catch (complianceError) {
        console.warn(`[Crawler] Failed to configure game_compliance for ${savedGame.name}:`, (complianceError as Error).message);
      }

      return savedGame;
    } catch (error) {
      console.error(`[Crawler] Error saving game:`, (error as Error).message);
      throw error;
    }
  }
}

export const gameCrawler = new GameCrawler();
