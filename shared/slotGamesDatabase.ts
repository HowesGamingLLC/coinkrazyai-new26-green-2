/**
 * Comprehensive Slot Games Database
 * Complete list of real slot games with embedded play URLs
 * Includes metadata: RTP, Volatility, Provider, Features, Themes, etc.
 */

export interface SlotGameData {
  id: number;
  name: string;
  title: string;
  provider: string;
  category: string;
  description?: string;
  image_url?: string;
  embed_url: string;
  rtp: number;
  volatility: 'Low' | 'Medium' | 'High';
  min_bet?: number;
  max_bet?: number;
  features: string[];
  themes: string[];
  paylines?: number;
  release_date?: string;
  enabled: boolean;
  game_type: 'video' | 'classic' | 'progressive';
  is_demo?: boolean;
}

/**
 * Pragmatic Play Games
 */
const PRAGMATIC_GAMES: SlotGameData[] = [
  {
    id: 1,
    name: 'Knights vs Barbarians',
    title: 'Knights vs Barbarians',
    provider: 'Pragmatic Play',
    category: 'Slots',
    description: 'Experience epic battles between knights and barbarians in this thrilling slot game',
    image_url: 'https://clashofslots.com/wp-content/uploads/2025/12/knights-vs-barbarians-logo-1.jpg',
    embed_url: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?stylename=demo_clienthub&lang=en&cur=USD&websiteUrl=https%3A%2F%2Fclienthub.pragmaticplay.com%2F&gcpif=2273&gameSymbol=vs10cenrlgdevl&jurisdiction=99&lobbyUrl=https://clienthub.pragmaticplay.com/slots/game-library/',
    rtp: 96.4,
    volatility: 'Medium',
    min_bet: 0.25,
    max_bet: 125,
    paylines: 25,
    features: ['Free Spins', 'Wilds', 'Multipliers'],
    themes: ['Fantasy', 'Adventure'],
    release_date: '2024-12-20',
    enabled: true,
    game_type: 'video'
  },
  {
    id: 2,
    name: 'Emerald King Wheel of Wealth',
    title: 'Emerald King Wheel of Wealth',
    provider: 'Pragmatic Play',
    category: 'Slots',
    description: 'Spin the wheel of fortune in this luxurious emerald-themed slot adventure',
    image_url: 'https://clashofslots.com/wp-content/uploads/2025/12/emerald-king-wheel-of-wealth-logo.jpg',
    embed_url: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?stylename=demo_clienthub&lang=en&cur=USD&websiteUrl=https%3A%2F%2Fclienthub.pragmaticplay.com%2Fru%2F&gcpif=2273&gameSymbol=vs10dublin&jurisdiction=99',
    rtp: 96.5,
    volatility: 'Medium',
    min_bet: 0.25,
    max_bet: 125,
    paylines: 25,
    features: ['Free Spins', 'Bonus Wheel', 'Progressive Jackpot'],
    themes: ['Luxury', 'Gems', 'Wealth'],
    release_date: '2024-11-15',
    enabled: true,
    game_type: 'video'
  }
];

/**
 * Play'n GO Games
 */
const PLAYNGO_GAMES: SlotGameData[] = [
  {
    id: 10,
    name: '3 Blades & Blessings',
    title: '3 Blades & Blessings',
    provider: 'Play\'n GO',
    category: 'Slots',
    description: 'Mythological adventure with ancient gods and sacred treasures',
    image_url: 'https://clashofslots.com/wp-content/uploads/2026/01/3-blades-blessings-logo.jpg',
    embed_url: 'https://released.playngonetwork.com/casino/ContainerLauncher?pid=2&gid=3bladesandblessings&lang=en_GB&practice=1&channel=desktop&demo=2',
    rtp: 96.2,
    volatility: 'High',
    min_bet: 0.10,
    max_bet: 100,
    paylines: 20,
    features: ['Free Spins', 'Stacked Symbols', 'Wild Reels'],
    themes: ['Mythology', 'Fantasy'],
    release_date: '2026-01-10',
    enabled: true,
    game_type: 'video'
  }
];

/**
 * ELK Studios Games
 */
const ELK_GAMES: SlotGameData[] = [
  {
    id: 20,
    name: 'Arcanum',
    title: 'Arcanum',
    provider: 'ELK Studios',
    category: 'Slots',
    description: 'Mystical magical experience with arcane symbols and enchanted features',
    image_url: 'https://clashofslots.com/wp-content/uploads/2025/11/arcanum-logo.jpg',
    embed_url: 'https://static-stage.contentmedia.eu/ecf3/index.html?gameid=10256&operatorid=44&currency=EUR&mode=demo&device=desktop&gamename=arcanum&language=en_gb&xdm=1&capi=https%3A%2F%2Fgc5-stage.contentmedia.eu%2Fcapi&papi=https%3A%2F%2Fpapi-stage.contentmedia.eu',
    rtp: 96.3,
    volatility: 'Medium',
    min_bet: 0.20,
    max_bet: 100,
    paylines: 32,
    features: ['Expanding Symbols', 'Free Spins', 'Cascading Reels'],
    themes: ['Magic', 'Mystery'],
    release_date: '2025-11-01',
    enabled: true,
    game_type: 'video'
  }
];

/**
 * Red Tiger Gaming Games
 */
const RED_TIGER_GAMES: SlotGameData[] = [
  {
    id: 30,
    name: 'Dragon Boyz',
    title: 'Dragon Boyz',
    provider: 'Red Tiger Gaming',
    category: 'Slots',
    description: 'Roaring action with dragons and fiery wins',
    image_url: 'https://clashofslots.com/wp-content/uploads/2025/12/dragon-boyz-logo.jpg',
    embed_url: 'https://playin.com/embed/v1/demo/dragonboyz000000',
    rtp: 96.1,
    volatility: 'High',
    min_bet: 0.10,
    max_bet: 50,
    paylines: 25,
    features: ['Free Spins', 'Re-spins', 'Dragon Multiplier'],
    themes: ['Dragon', 'Asian'],
    release_date: '2025-12-10',
    enabled: true,
    game_type: 'video'
  }
];

/**
 * Betsoft Games
 */
const BETSOFT_GAMES: SlotGameData[] = [
  {
    id: 40,
    name: 'Once Again upon a Time',
    title: 'Once Again upon a Time',
    provider: 'Betsoft',
    category: 'Slots',
    description: 'Fairy tale adventure with beloved storybook characters',
    image_url: 'https://clashofslots.com/wp-content/uploads/2026/01/once-again-upon-a-time-logo.jpg',
    embed_url: 'http://democasino.betsoftgaming.com/cwguestlogin.do?bankId=675&CDN=AUTO&gameId=996',
    rtp: 96.2,
    volatility: 'Medium',
    min_bet: 0.25,
    max_bet: 75,
    paylines: 30,
    features: ['Free Spins', 'Bonus Game', 'Scatter Symbols'],
    themes: ['Fairy Tale', 'Magic'],
    release_date: '2026-01-05',
    enabled: true,
    game_type: 'video'
  },
  {
    id: 41,
    name: 'Once Upon a Time',
    title: 'Once Upon a Time',
    provider: 'Betsoft',
    category: 'Slots',
    description: 'A classic fairy tale adventure with magic and treasure.',
    image_url: 'https://clashofslots.com/wp-content/uploads/2010/01/once-upon-a-time-logo.jpg',
    embed_url: 'https://democasino.betsoftgaming.com/cwguestlogin.do?bankId=675&CDN=AUTO&gameId=792',
    rtp: 96.0,
    volatility: 'Medium',
    min_bet: 0.02,
    max_bet: 150,
    paylines: 30,
    features: ['Free Spins', 'Bonus Game', 'Click Me'],
    themes: ['Fairy Tale', 'Magic', 'Adventure'],
    release_date: '2010-01-01',
    enabled: true,
    game_type: 'video'
  }
];

/**
 * Endorphina Games
 */
const ENDORPHINA_GAMES: SlotGameData[] = [
  {
    id: 50,
    name: 'Love Show',
    title: 'Love Show',
    provider: 'Endorphina',
    category: 'Slots',
    description: 'Romantic and entertaining game show experience',
    image_url: 'https://clashofslots.com/wp-content/uploads/2026/02/love-show-logo.jpg',
    embed_url: 'https://endorphina.com/games/love-show/play',
    rtp: 96.0,
    volatility: 'Low',
    min_bet: 0.10,
    max_bet: 100,
    paylines: 18,
    features: ['Free Spins', 'Bonus Rounds', 'Instant Wins'],
    themes: ['Romance', 'Entertainment'],
    release_date: '2026-02-01',
    enabled: true,
    game_type: 'video'
  }
];

/**
 * AvatarUX Games
 */
const AVATARUX_GAMES: SlotGameData[] = [
  {
    id: 60,
    name: 'Shippy D Pop',
    title: 'Shippy D Pop',
    provider: 'AvatarUX',
    category: 'Slots',
    description: 'Fun naval adventure with popping symbols and cascading wins',
    image_url: 'https://clashofslots.com/wp-content/uploads/2026/02/shippy-d-pop-logo.jpg',
    embed_url: 'https://cdn-replay-eu.avatarux.app/shippy-d-pop/index.html?game=shippy-d-pop&wallet=demo&operator=demo&key=&server=https%3A%2F%2Freplay-eu.avatarux.app&language=en&provider=avatarux&channel=desktop&rgs=avatarux-rgs',
    rtp: 95.9,
    volatility: 'Medium',
    min_bet: 0.20,
    max_bet: 60,
    paylines: 15,
    features: ['Cascading Reels', 'Free Spins', 'Collect Symbols'],
    themes: ['Nautical', 'Fun'],
    release_date: '2026-02-10',
    enabled: true,
    game_type: 'video'
  }
];

/**
 * Reel Kingdom Games
 */
const REEL_KINGDOM_GAMES: SlotGameData[] = [
  {
    id: 70,
    name: 'Lucky Tiger Gold',
    title: 'Lucky Tiger Gold',
    provider: 'Fat Panda',
    category: 'Slots',
    description: 'Asian-themed luck and fortune with golden tiger symbols',
    image_url: 'https://clashofslots.com/wp-content/uploads/2026/02/lucky-tiger-gold-logo.jpg',
    embed_url: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?stylename=demo_clienthub&lang=en&cur=USD&websiteUrl=https%3A%2F%2Fclienthub.pragmaticplay.com%2Fru%2F&gcpif=2273&gameSymbol=vs5luckytru&jurisdiction=99',
    rtp: 96.0,
    volatility: 'High',
    min_bet: 0.25,
    max_bet: 125,
    paylines: 25,
    features: ['Wild Symbols', 'Bonus Spins', 'Multiplier Wilds'],
    themes: ['Asian', 'Luck', 'Wealth'],
    release_date: '2026-02-15',
    enabled: true,
    game_type: 'video'
  }
];

/**
 * Peter & Sons Games
 */
const PETER_SONS_GAMES: SlotGameData[] = [
  {
    id: 80,
    name: 'Bunny Heist',
    title: 'Bunny Heist',
    provider: 'Peter & Sons',
    category: 'Slots',
    description: 'Cute bunnies planning the ultimate heist for treasure',
    image_url: 'https://clashofslots.com/wp-content/uploads/2026/02/bunny-heist-logo.jpg',
    embed_url: 'https://peterandsons.org/launcher.html?gameId=bunny-heist',
    rtp: 95.8,
    volatility: 'Medium',
    min_bet: 0.10,
    max_bet: 80,
    paylines: 20,
    features: ['Free Spins', 'Heist Bonus', 'Collectible Symbols'],
    themes: ['Animals', 'Adventure'],
    release_date: '2026-02-05',
    enabled: true,
    game_type: 'video'
  }
];

/**
 * Gamebeat Games
 */
const GAMEBEAT_GAMES: SlotGameData[] = [
  {
    id: 90,
    name: 'Sticky Wild: Farm 51',
    title: 'Sticky Wild: Farm 51',
    provider: 'Gamebeat',
    category: 'Slots',
    description: 'Farm-themed adventure with sticky wild features',
    image_url: 'https://clashofslots.com/wp-content/themes/clashofslots/images/slot_upcoming_thumb.svg',
    embed_url: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?stylename=demo_clienthub&lang=en&cur=USD&websiteUrl=https%3A%2F%2Fclienthub.pragmaticplay.com%2F&gcpif=2273&gameSymbol=vs25buffalo',
    rtp: 96.2,
    volatility: 'Low',
    min_bet: 0.05,
    max_bet: 50,
    paylines: 15,
    features: ['Sticky Wilds', 'Free Spins', 'Expanding Reels'],
    themes: ['Farm', 'Nature'],
    release_date: '2025-12-01',
    enabled: true,
    game_type: 'video'
  }
];

/**
 * Classic/Traditional Slots
 */
const CLASSIC_SLOTS: SlotGameData[] = [
  {
    id: 100,
    name: 'Golden Sevens',
    title: 'Golden Sevens',
    provider: 'Classic Games',
    category: 'Slots',
    description: 'Traditional three-reel classic with timeless appeal',
    image_url: 'https://images.pexels.com/photos/29825627/pexels-photo-29825627.jpeg',
    embed_url: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?stylename=demo_clienthub&lang=en&cur=USD&websiteUrl=https%3A%2F%2Fclienthub.pragmaticplay.com%2F&gcpif=2273&gameSymbol=vs25wolfgold',
    rtp: 95.0,
    volatility: 'Low',
    min_bet: 0.01,
    max_bet: 10,
    paylines: 1,
    features: ['Multiplier', 'Wild Symbol'],
    themes: ['Classic', 'Retro'],
    release_date: '2024-01-01',
    enabled: true,
    game_type: 'classic'
  },
  {
    id: 101,
    name: 'Cherry Blast',
    title: 'Cherry Blast',
    provider: 'Classic Games',
    category: 'Slots',
    description: 'Fruity classic slot machine with explosive wins',
    image_url: 'https://images.pexels.com/photos/7594263/pexels-photo-7594263.jpeg',
    embed_url: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?stylename=demo_clienthub&lang=en&cur=USD&websiteUrl=https%3A%2F%2Fclienthub.pragmaticplay.com%2F&gcpif=2273&gameSymbol=vs20sweetbonanza',
    rtp: 94.5,
    volatility: 'Low',
    min_bet: 0.01,
    max_bet: 15,
    paylines: 3,
    features: ['Free Spin', 'Wild'],
    themes: ['Fruit', 'Classic'],
    release_date: '2024-01-15',
    enabled: true,
    game_type: 'classic'
  }
];

/**
 * Progressive Jackpot Games
 */
const PROGRESSIVE_GAMES: SlotGameData[] = [
  {
    id: 110,
    name: 'Mega Fortune Dreams',
    title: 'Mega Fortune Dreams',
    provider: 'NetEnt',
    category: 'Slots',
    description: 'Multi-level progressive jackpot with luxury theme',
    image_url: 'https://images.pexels.com/photos/29825629/pexels-photo-29825629.jpeg',
    embed_url: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?stylename=demo_clienthub&lang=en&cur=USD&websiteUrl=https%3A%2F%2Fclienthub.pragmaticplay.com%2F&gcpif=2273&gameSymbol=vs20hfruit',
    rtp: 96.8,
    volatility: 'High',
    min_bet: 0.30,
    max_bet: 150,
    paylines: 20,
    features: ['Progressive Jackpot', 'Free Spins', 'Bonus Game'],
    themes: ['Luxury', 'Wealth', 'Jackpot'],
    release_date: '2025-06-01',
    enabled: true,
    game_type: 'progressive'
  }
];

/**
 * Game Show Games
 */
const GAME_SHOW_GAMES: SlotGameData[] = [
  {
    id: 200,
    name: 'Crazy Time',
    title: 'Crazy Time',
    provider: 'Evolution',
    category: 'Game Shows',
    description: 'The most popular live game show in the world with four exciting bonus games.',
    image_url: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&q=80',
    embed_url: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?stylename=demo_clienthub&lang=en&cur=USD&websiteUrl=https%3A%2F%2Fclienthub.pragmaticplay.com%2F&gcpif=2273&gameSymbol=vswayscland',
    rtp: 96.08,
    volatility: 'High',
    min_bet: 0.10,
    max_bet: 5000,
    features: ['Coin Flip', 'Cash Hunt', 'Pachinko', 'Crazy Time Bonus'],
    themes: ['Wheel of Fortune', 'Live Show'],
    release_date: '2020-07-01',
    enabled: true,
    game_type: 'video'
  },
  {
    id: 201,
    name: 'Monopoly Live',
    title: 'Monopoly Live',
    provider: 'Evolution',
    category: 'Game Shows',
    description: 'A unique live online variant of the hugely popular MONOPOLY board game.',
    image_url: 'https://images.pexels.com/photos/4792375/pexels-photo-4792375.jpeg',
    embed_url: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?stylename=demo_clienthub&lang=en&cur=USD&websiteUrl=https%3A%2F%2Fclienthub.pragmaticplay.com%2F&gcpif=2273&gameSymbol=vs5megawheel',
    rtp: 96.23,
    volatility: 'High',
    min_bet: 0.10,
    max_bet: 2500,
    features: ['3D Bonus Game', 'Chance Multiplier', '2 Rolls', '4 Rolls'],
    themes: ['Board Game', 'Live Show'],
    release_date: '2019-04-01',
    enabled: true,
    game_type: 'video'
  }
];

/**
 * CT Interactive Games
 */
const CT_INTERACTIVE_GAMES: SlotGameData[] = [
  {
    id: 300,
    name: 'Big Joker',
    title: 'Big Joker',
    provider: 'CT Interactive',
    category: 'Slots',
    description: 'Classic fruit-themed slot with a big joker surprise!',
    image_url: 'https://images.pexels.com/photos/2838511/pexels-photo-2838511.jpeg',
    embed_url: 'https://free-slots.games/game/BigJokerCT/',
    rtp: 95.8,
    volatility: 'Medium',
    min_bet: 0.01,
    max_bet: 100,
    features: ['Wild', 'Scatter', 'Free Spins'],
    themes: ['Fruit', 'Classic', 'Joker'],
    release_date: '2024-01-01',
    enabled: true,
    game_type: 'classic'
  }
];

/**
 * Live Casino Games
 */
const LIVE_CASINO_GAMES: SlotGameData[] = [
  {
    id: 400,
    name: 'Lightning Roulette',
    title: 'Lightning Roulette',
    provider: 'Evolution',
    category: 'Live Casino',
    description: 'Electrifying live roulette with lucky number multipliers.',
    image_url: 'https://images.pexels.com/photos/7594382/pexels-photo-7594382.jpeg',
    embed_url: 'https://evolution-embed.example.com/lightning-roulette',
    rtp: 97.3,
    volatility: 'High',
    min_bet: 0.20,
    max_bet: 10000,
    features: ['Multipliers', 'Live Dealer'],
    themes: ['Roulette', 'Live'],
    release_date: '2018-03-01',
    enabled: true,
    game_type: 'video'
  },
  {
    id: 401,
    name: 'Infinite Blackjack',
    title: 'Infinite Blackjack',
    provider: 'Evolution',
    category: 'Live Casino',
    description: 'Live blackjack with unlimited seats and low stakes.',
    image_url: 'https://images.pexels.com/photos/7594258/pexels-photo-7594258.jpeg',
    embed_url: 'https://evolution-embed.example.com/infinite-blackjack',
    rtp: 99.47,
    volatility: 'Low',
    min_bet: 1.0,
    max_bet: 5000,
    features: ['Side Bets', 'Live Dealer'],
    themes: ['Blackjack', 'Live'],
    release_date: '2018-10-01',
    enabled: true,
    game_type: 'video'
  },
  {
    id: 402,
    name: 'Speed Baccarat',
    title: 'Speed Baccarat',
    provider: 'Evolution',
    category: 'Live Casino',
    description: 'Fast-paced live baccarat action.',
    image_url: 'https://images.pexels.com/photos/7594253/pexels-photo-7594253.jpeg',
    embed_url: 'https://evolution-embed.example.com/speed-baccarat',
    rtp: 98.94,
    volatility: 'Medium',
    min_bet: 1.0,
    max_bet: 15000,
    features: ['Live Dealer'],
    themes: ['Baccarat', 'Live'],
    release_date: '2017-01-01',
    enabled: true,
    game_type: 'video'
  }
];

/**
 * Table Games (RNG)
 */
const RNG_TABLE_GAMES: SlotGameData[] = [
  {
    id: 500,
    name: 'European Roulette',
    title: 'European Roulette',
    provider: 'Pragmatic Play',
    category: 'Table Games',
    description: 'Classic European roulette with a single zero.',
    image_url: 'https://images.pexels.com/photos/7594195/pexels-photo-7594195.jpeg',
    embed_url: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?stylename=demo_clienthub&lang=en&cur=USD&websiteUrl=https%3A%2F%2Fclienthub.pragmaticplay.com%2F&gcpif=2273&gameSymbol=vs20roulette',
    rtp: 97.3,
    volatility: 'Medium',
    min_bet: 0.10,
    max_bet: 100,
    features: ['Racetrack Bets'],
    themes: ['Roulette', 'Classic'],
    release_date: '2019-01-01',
    enabled: true,
    game_type: 'video'
  },
  {
    id: 501,
    name: 'Multihand Blackjack',
    title: 'Multihand Blackjack',
    provider: 'Pragmatic Play',
    category: 'Table Games',
    description: 'Play up to 3 hands simultaneously.',
    image_url: 'https://images.unsplash.com/photo-1518893063132-36e46dbe2498?w=800&q=80',
    embed_url: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?stylename=demo_clienthub&lang=en&cur=USD&websiteUrl=https%3A%2F%2Fclienthub.pragmaticplay.com%2F&gcpif=2273&gameSymbol=vs20blackjack',
    rtp: 99.51,
    volatility: 'Low',
    min_bet: 1.0,
    max_bet: 100,
    features: ['Multihand'],
    themes: ['Blackjack', 'Classic'],
    release_date: '2019-05-01',
    enabled: true,
    game_type: 'video'
  }
];

/**
 * Combine all games into a single database
 */
export const ALL_SLOT_GAMES: SlotGameData[] = [
  ...PRAGMATIC_GAMES,
  ...PLAYNGO_GAMES,
  ...ELK_GAMES,
  ...RED_TIGER_GAMES,
  ...BETSOFT_GAMES,
  ...ENDORPHINA_GAMES,
  ...AVATARUX_GAMES,
  ...REEL_KINGDOM_GAMES,
  ...PETER_SONS_GAMES,
  ...GAMEBEAT_GAMES,
  ...CLASSIC_SLOTS,
  ...PROGRESSIVE_GAMES,
  ...GAME_SHOW_GAMES,
  ...CT_INTERACTIVE_GAMES,
  ...LIVE_CASINO_GAMES,
  ...RNG_TABLE_GAMES
];

/**
 * Helper Functions
 */

export function getGameById(id: number): SlotGameData | undefined {
  return ALL_SLOT_GAMES.find(game => game.id === id);
}

export function getGameByName(name: string): SlotGameData | undefined {
  return ALL_SLOT_GAMES.find(game => game.name.toLowerCase() === name.toLowerCase());
}

export function getGamesByProvider(provider: string): SlotGameData[] {
  return ALL_SLOT_GAMES.filter(game => game.provider.toLowerCase() === provider.toLowerCase());
}

export function getGamesByTheme(theme: string): SlotGameData[] {
  return ALL_SLOT_GAMES.filter(game => 
    game.themes.some(t => t.toLowerCase() === theme.toLowerCase())
  );
}

export function getGamesByFeature(feature: string): SlotGameData[] {
  return ALL_SLOT_GAMES.filter(game =>
    game.features.some(f => f.toLowerCase() === feature.toLowerCase())
  );
}

export function getGamesByVolatility(volatility: 'Low' | 'Medium' | 'High'): SlotGameData[] {
  return ALL_SLOT_GAMES.filter(game => game.volatility === volatility);
}

export function getGamesByType(type: 'video' | 'classic' | 'progressive'): SlotGameData[] {
  return ALL_SLOT_GAMES.filter(game => game.game_type === type);
}

export function getTopRTPGames(count: number = 10): SlotGameData[] {
  return [...ALL_SLOT_GAMES].sort((a, b) => b.rtp - a.rtp).slice(0, count);
}

export function getNewGames(days: number = 30): SlotGameData[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return ALL_SLOT_GAMES.filter(game => {
    if (!game.release_date) return false;
    return new Date(game.release_date) >= cutoffDate;
  });
}

export function searchGames(query: string): SlotGameData[] {
  const lowerQuery = query.toLowerCase();
  return ALL_SLOT_GAMES.filter(game =>
    game.name.toLowerCase().includes(lowerQuery) ||
    game.provider.toLowerCase().includes(lowerQuery) ||
    game.description?.toLowerCase().includes(lowerQuery) ||
    game.themes.some(t => t.toLowerCase().includes(lowerQuery)) ||
    game.features.some(f => f.toLowerCase().includes(lowerQuery))
  );
}

export function getUniqueProviders(): string[] {
  const providers = new Set(ALL_SLOT_GAMES.map(game => game.provider));
  return Array.from(providers).sort();
}

export function getUniqueThemes(): string[] {
  const themes = new Set<string>();
  ALL_SLOT_GAMES.forEach(game => {
    game.themes.forEach(theme => themes.add(theme));
  });
  return Array.from(themes).sort();
}

export function getUniqueFeatures(): string[] {
  const features = new Set<string>();
  ALL_SLOT_GAMES.forEach(game => {
    game.features.forEach(feature => features.add(feature));
  });
  return Array.from(features).sort();
}
