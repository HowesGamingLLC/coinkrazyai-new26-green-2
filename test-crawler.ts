import { gameCrawler } from './server/services/game-crawler';

async function test() {
  console.log('Testing GameCrawler...');
  
  // Test a known URL (if accessible)
  const url = 'https://free-slots.games/game/BigJokerCT/';
  console.log(`Crawling ${url}...`);
  
  try {
    const game = await gameCrawler.crawlUrl(url);
    if (game) {
      console.log('Successfully crawled game:');
      console.log(JSON.stringify(game, null, 2));
    } else {
      console.log('Crawl returned null (might be a list page or failed to parse)');
    }
  } catch (error: any) {
    console.error('Crawl error:', error.message);
  }
}

test();
