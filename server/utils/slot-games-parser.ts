/**
 * Utility to parse slot game data from HTML or JSON
 * Used to seed the database with new slot games
 */

export interface ParsedSlotGame {
  name: string;
  provider: string;
  image_url: string;
  description?: string;
  category: string;
  rtp?: number;
  volatility?: string;
  badges?: string[];
  enabled?: boolean;
}

/**
 * Sample slot games from popular providers
 * This data can be used to seed the database
 */
export const SLOT_GAMES_DATA: ParsedSlotGame[] = [
  // Pragmatic Play Games
  {
    name: '3 Blades & Blessings',
    provider: 'Pragmatic',
    image_url: 'https://clashofslots.com/wp-content/uploads/2026/01/3-blades-blessings-logo.jpg',
    description: 'Epic warrior-themed slot with mystical blessings',
    category: 'Slots',
    rtp: 96.5,
    volatility: 'High',
    badges: ['New'],
    enabled: true
  },
  {
    name: 'Arcanum',
    provider: 'ELK Studios',
    image_url: 'https://clashofslots.com/wp-content/uploads/2025/11/arcanum-logo.jpg',
    description: 'Mystical magical slot with hidden treasures',
    category: 'Slots',
    rtp: 96.0,
    volatility: 'High',
    badges: ['New', 'Buy Bonus'],
    enabled: true
  },
  {
    name: 'Bunny Heist',
    provider: 'Peter & Sons',
    image_url: 'https://clashofslots.com/wp-content/uploads/2026/02/bunny-heist-logo.jpg',
    description: 'Cute bunnies on a heist adventure with big wins',
    category: 'Slots',
    rtp: 96.2,
    volatility: 'High',
    badges: ['New', 'Buy Bonus'],
    enabled: true
  },
  {
    name: 'Dragon Boyz',
    provider: 'Red Tiger Gaming',
    image_url: 'https://clashofslots.com/wp-content/uploads/2025/12/dragon-boyz-logo.jpg',
    description: 'Dragon-themed adventure with epic multipliers',
    category: 'Slots',
    rtp: 96.5,
    volatility: 'High',
    badges: ['New', 'Buy Bonus'],
    enabled: true
  },
  {
    name: 'Knights vs Barbarians',
    provider: 'Pragmatic',
    image_url: 'https://clashofslots.com/wp-content/uploads/2025/12/knights-vs-barbarians-logo-1.jpg',
    description: 'Epic battle between knights and barbarians',
    category: 'Slots',
    rtp: 96.5,
    volatility: 'High',
    badges: ['New', 'Buy Bonus'],
    enabled: true
  },
  {
    name: 'Love Show',
    provider: 'Endorphina',
    image_url: 'https://clashofslots.com/wp-content/uploads/2026/02/love-show-logo.jpg',
    description: 'Romantic-themed slot with love-filled wins',
    category: 'Slots',
    rtp: 96.0,
    volatility: 'Medium',
    badges: ['New'],
    enabled: true
  },
  {
    name: 'Once Again upon a Time',
    provider: 'Betsoft',
    image_url: 'https://clashofslots.com/wp-content/uploads/2026/01/once-again-upon-a-time-logo.jpg',
    description: 'Fairytale adventure with magical features',
    category: 'Slots',
    rtp: 96.3,
    volatility: 'High',
    badges: ['New', 'Buy Bonus'],
    enabled: true
  },
  {
    name: 'Shippy D Pop',
    provider: 'AvatarUX',
    image_url: 'https://clashofslots.com/wp-content/uploads/2026/02/shippy-d-pop-logo.jpg',
    description: 'Colorful pop adventure with ship treasures',
    category: 'Slots',
    rtp: 96.1,
    volatility: 'High',
    badges: ['New', 'Buy Bonus'],
    enabled: true
  },
  {
    name: 'Zeus Ze Zecond',
    provider: 'Hacksaw Gaming',
    image_url: 'https://clashofslots.com/wp-content/uploads/2025/11/zeus-ze-zecond-logo.jpg',
    description: 'Greek mythology with powerful Zeus symbols',
    category: 'Slots',
    rtp: 96.4,
    volatility: 'High',
    badges: ['New', 'Buy Bonus'],
    enabled: true
  },
  {
    name: 'Only Diamonds',
    provider: 'Gamzix',
    image_url: 'https://clashofslots.com/wp-content/uploads/2026/02/only-diamonds-logo.jpg',
    description: 'Diamond-focused slot with high-value prizes',
    category: 'Slots',
    rtp: 96.2,
    volatility: 'High',
    badges: ['New'],
    enabled: true
  },
  {
    name: 'Red Hot Multipliers',
    provider: 'Push Gaming',
    image_url: 'https://clashofslots.com/wp-content/uploads/2025/11/red-hot-multipliers-logo.jpg',
    description: 'Fiery multipliers for massive payouts',
    category: 'Slots',
    rtp: 96.3,
    volatility: 'High',
    badges: ['New'],
    enabled: true
  },
  {
    name: 'Snack Me Up!',
    provider: 'Mancala Gaming',
    image_url: 'https://clashofslots.com/wp-content/uploads/2026/02/snack-me-up-logo.jpg',
    description: 'Tasty snack-themed adventure slot',
    category: 'Slots',
    rtp: 96.0,
    volatility: 'High',
    badges: ['New', 'Buy Bonus'],
    enabled: true
  },
  {
    name: 'Fortune Love',
    provider: 'Amigo Gaming',
    image_url: 'https://clashofslots.com/wp-content/uploads/2026/02/fortune-love-logo.jpg',
    description: 'Love and fortune combined for sweet wins',
    category: 'Slots',
    rtp: 96.1,
    volatility: 'Medium',
    badges: ['New'],
    enabled: true
  },
  {
    name: 'Lucy Luck and the Quest for Coins',
    provider: 'Slotmill',
    image_url: 'https://clashofslots.com/wp-content/uploads/2026/01/lucy-luck-and-the-quest-for-coins-logo.jpg',
    description: 'Lucky Lucy\'s journey through coin treasures',
    category: 'Slots',
    rtp: 96.2,
    volatility: 'High',
    badges: ['New', 'Buy Bonus'],
    enabled: true
  },
  {
    name: 'Olympus 7\'s Dream Drop',
    provider: 'Relax Gaming',
    image_url: 'https://clashofslots.com/wp-content/uploads/2026/02/olympus-7s-dream-drop-logo.jpg',
    description: 'Olympus mythology with dream drop features',
    category: 'Slots',
    rtp: 96.4,
    volatility: 'High',
    badges: ['New'],
    enabled: true
  },
  {
    name: 'Robbits',
    provider: 'Quickspin',
    image_url: 'https://clashofslots.com/wp-content/uploads/2025/12/robbits-logo.jpg',
    description: 'Robotic rabbits with clever mechanics',
    category: 'Slots',
    rtp: 96.5,
    volatility: 'High',
    badges: ['New', 'Buy Bonus'],
    enabled: true
  }
];

/**
 * Parse HTML game data (for future use if needed)
 */
export function parseGameFromHTML(element: Element): ParsedSlotGame | null {
  try {
    const titleEl = element.querySelector('.slots_carousel_item_title_prov__title span');
    const providerEl = element.querySelector('.slots_carousel_item_title_prov__prov');
    const imgEl = element.querySelector('img.wp-post-image');
    
    if (!titleEl || !providerEl || !imgEl) return null;

    const name = titleEl.textContent?.trim() || '';
    const provider = providerEl.textContent?.trim() || '';
    const image_url = imgEl.getAttribute('src') || '';
    const badges = Array.from(element.querySelectorAll('.slots_carousel_item_badge'))
      .map(el => el.textContent?.trim() || '')
      .filter(Boolean);

    return {
      name,
      provider,
      image_url,
      category: 'Slots',
      badges,
      enabled: true
    };
  } catch (error) {
    console.error('Error parsing game from HTML:', error);
    return null;
  }
}

export default SLOT_GAMES_DATA;
