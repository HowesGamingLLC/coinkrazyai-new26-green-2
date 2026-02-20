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
  max_paylines?: number;
  release_date?: string;
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
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
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
      const $ = cheerio.load(html);

      // Extract title from multiple possible locations
      let title = this.extractTitle(html, $);

      // Extract RTP from various patterns
      const rtp = this.extractRTP(html, $);

      // Extract volatility
      const volatility = this.extractVolatility(html, $);

      // Extract description
      const description = this.extractDescription(html, $);

      // Extract image URL
      const image_url = this.extractImageUrl(html, $, url);

      // Extract additional data
      const max_paylines = this.extractPaylines(html, $);
      const release_date = this.extractReleaseDate(html, $);

      if (!title || title.length < 2) {
        console.warn(`[Crawler] Could not extract title from ${url}`);
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
        max_paylines,
        release_date,
        source: url,
      };
    } catch (error) {
      console.error(`[Crawler] Error parsing HTML: ${(error as Error).message}`);
      return null;
    }
  }

  private extractTitle(html: string, $: cheerio.CheerioAPI): string {
    // Try various title extraction methods
    let title = $('title').text().trim();

    if (!title || title.toLowerCase().includes('just a moment')) {
      const h1Title = $('h1').first().text().trim();
      if (h1Title) title = h1Title;
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

    // Clean up common suffixes and prefixes
    title = title
      .replace(/Slot Review/i, '')
      .replace(/Demo Slot/i, '')
      .replace(/Play for Free/i, '')
      .replace(/Online Slot/i, '')
      .split('|')[0]
      .split('-')[0]
      .split(':')[0]
      .trim();

    // Remove provider names if they are in parentheses like "Sweet Bonanza (Pragmatic Play)"
    title = title.replace(/\s*\([^)]+\)$/, '').trim();

    return title;
  }

  private extractRTP(html: string, $: cheerio.CheerioAPI): number {
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

    return description || 'Game details not available';
  }

  private extractImageUrl(html: string, $: cheerio.CheerioAPI, baseUrl: string): string | undefined {
    // Try OG image first
    let imageUrl = $('meta[property="og:image"]').attr('content');

    if (!imageUrl) {
      imageUrl = $('meta[name="image"]').attr('content');
    }

    if (!imageUrl) {
      // Try to find game image in common locations
      imageUrl = $('img.game-image').first().attr('src') ||
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

  private extractPaylines(html: string, $: cheerio.CheerioAPI): number | undefined {
    const patterns = [
      /(\d+)[\s]+paylines?/i,
      /Paylines?[:\s]+(\d+)/i,
      /lines?[:\s]+(\d+)/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        const paylines = parseInt(match[1]);
        if (!isNaN(paylines) && paylines > 0 && paylines <= 10000) {
          return paylines;
        }
      }
    }

    return undefined;
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
      'Pragmatic Play': /pragmatic|pp/i,
      'Microgaming': /microgaming|mg/i,
      'NetEnt': /netent/i,
      'Nolimit City': /nolimit|no limit/i,
      'Hacksaw Gaming': /hacksaw/i,
      'Relax Gaming': /relax gaming/i,
      'IGT': /igt|wagerworks/i,
      'WMS': /wms|williams/i,
      'Playtech': /playtech|pt/i,
      'Bally': /bally/i,
      'Play\'n GO': /playngo|play n go/i,
      'Betsoft': /betsoft|bs/i,
      'Red Tiger': /red tiger|redtiger/i,
      'Quickspin': /quickspin/i,
      'Yggdrasil': /yggdrasil|yg/i,
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

      const response = await axios.get(url, {
        headers: this.config.headers,
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
  async crawlMultiple(urls: string[]): Promise<CrawledGame[]> {
    const results: CrawledGame[] = [];

    for (const url of urls) {
      try {
        const gameData = await this.crawlUrl(url);
        if (gameData) {
          results.push(gameData);
        }
      } catch (error) {
        console.error(`[Crawler] Failed to process ${url}:`, (error as Error).message);
        continue;
      }
    }

    console.log(`[Crawler] Successfully crawled ${results.length} out of ${urls.length} URLs`);
    return results;
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
      const existingGame = await query(
        'SELECT id FROM games WHERE name = $1 AND provider = $2',
        [gameData.title, gameData.provider]
      );

      if (existingGame.rows.length > 0) {
        console.log(`[Crawler] Game already exists: ${gameData.title}`);
        return { exists: true, id: existingGame.rows[0].id };
      }

      // Insert new game
      const slug = gameData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      const result = await query(
        `INSERT INTO games (name, slug, category, provider, rtp, volatility, description, image_url, enabled)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
         RETURNING *`,
        [gameData.title, slug, 'Slots', gameData.provider, gameData.rtp, gameData.volatility, gameData.description, gameData.image_url]
      );

      const savedGame = result.rows[0];

      // Store additional metadata in game_config
      if (gameData.max_paylines) {
        await query(
          'INSERT INTO game_config (game_id, config_key, config_value) VALUES ($1, $2, $3)',
          [savedGame.id, 'max_paylines', JSON.stringify(gameData.max_paylines)]
        );
      }

      if (gameData.release_date) {
        await query(
          'INSERT INTO game_config (game_id, config_key, config_value) VALUES ($1, $2, $3)',
          [savedGame.id, 'release_date', JSON.stringify(gameData.release_date)]
        );
      }

      // Store source URL
      await query(
        'INSERT INTO game_config (game_id, config_key, config_value) VALUES ($1, $2, $3)',
        [savedGame.id, 'crawl_source_url', JSON.stringify(gameData.source)]
      );

      console.log(`[Crawler] Saved game: ${gameData.title} (ID: ${savedGame.id})`);
      return savedGame;
    } catch (error) {
      console.error(`[Crawler] Error saving game:`, (error as Error).message);
      throw error;
    }
  }
}

export const gameCrawler = new GameCrawler();
