import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, TrendingUp, Search } from 'lucide-react';

export default function Games() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const games = [
    { name: 'Mega Spin Slots', category: 'Slots', rtp: '96.5%', players: 1204, rating: 4.8, image: '🎰', featured: true },
    { name: 'Diamond Poker Pro', category: 'Poker', rtp: '98.2%', players: 342, rating: 4.9, image: '♠️', featured: true },
    { name: 'Bingo Bonanza', category: 'Bingo', rtp: '94.8%', players: 2156, rating: 4.7, image: '🎲', featured: false },
    { name: 'Sports League', category: 'Sports', rtp: '97.5%', players: 567, rating: 4.6, image: '⚽', featured: false },
    { name: 'Fruit Frenzy', category: 'Slots', rtp: '95.0%', players: 234, rating: 4.5, image: '🍎', featured: false },
    { name: 'Blackjack Master', category: 'Cards', rtp: '99.2%', players: 456, rating: 4.8, image: '🂡', featured: true },
    { name: 'Roulette Royal', category: 'Cards', rtp: '97.3%', players: 789, rating: 4.4, image: '🎡', featured: false },
    { name: 'Lucky Wheel', category: 'Slots', rtp: '96.0%', players: 345, rating: 4.7, image: '🎪', featured: false }
  ];

  const categories = [
    { id: 'all', label: 'All Games' },
    { id: 'Slots', label: 'Slots' },
    { id: 'Poker', label: 'Poker' },
    { id: 'Bingo', label: 'Bingo' },
    { id: 'Sports', label: 'Sports' },
    { id: 'Cards', label: 'Card Games' }
  ];

  const filtered = games.filter(g => 
    (selectedCategory === 'all' || g.category === selectedCategory) &&
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featured = games.filter(g => g.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black">Game Library</h1>
          <p className="text-muted-foreground mt-2">Discover and play thousands of games</p>
        </div>

        {/* Featured Games */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            Featured Games
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((game) => (
              <Card key={game.name} className="border-primary/20 cursor-pointer hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="text-5xl mb-3">{game.image}</div>
                  <h3 className="font-bold mb-1">{game.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="text-xs bg-muted/50 border-none">{game.category}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs font-bold">{game.rating}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    <div>RTP: {game.rtp}</div>
                    <div>{game.players.toLocaleString()} players</div>
                  </div>
                  <Button className="w-full h-8 text-xs font-bold">Play Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-muted/50"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/70'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((game) => (
            <Card key={game.name} className="border-border cursor-pointer hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="text-4xl mb-3">{game.image}</div>
                <h3 className="font-bold text-sm mb-1">{game.name}</h3>
                <div className="flex items-center justify-between mb-3">
                  <Badge className="text-xs bg-muted/50 border-none">{game.category}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <span className="text-xs font-bold">{game.rating}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-3 space-y-1">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    RTP: {game.rtp}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {game.players.toLocaleString()} playing
                  </div>
                </div>
                <Button className="w-full h-8 text-xs font-bold">Play Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <Card className="border-border/30">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground text-lg">No games found matching your search.</p>
            </CardContent>
          </Card>
        )}

        {/* Load More */}
        <div className="flex justify-center">
          <Button variant="outline" className="font-bold">Load More Games</Button>
        </div>
      </div>
    </div>
  );
}
