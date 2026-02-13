import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Coins, TrendingUp, Users, Zap, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const games = [
    {
      title: 'Slots',
      description: '25+ AI-powered slot machines with dynamic RTP.',
      icon: Gamepad2,
      path: '/slots',
      players: '1.2k',
      badge: 'New AI RTP',
      color: 'from-blue-600 to-blue-400'
    },
    {
      title: 'Poker',
      description: 'Real-time SC tables with JoseyAI monitoring.',
      icon: Coins,
      path: '/poker',
      players: '840',
      badge: 'Pro Tables',
      color: 'from-green-600 to-green-400'
    },
    {
      title: 'Bingo',
      description: '10 rooms with rolling jackpots and auto-calling.',
      icon: Zap,
      path: '/bingo',
      players: '2.1k',
      badge: 'Jackpot',
      color: 'from-purple-600 to-purple-400'
    },
    {
      title: 'Sportsbook',
      description: 'Live lines and parlay bets for all major sports.',
      icon: TrendingUp,
      path: '/sportsbook',
      players: '1.5k',
      badge: 'Live Odds',
      color: 'from-orange-600 to-orange-400'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-muted p-8 md:p-12 border border-border">
        <div className="relative z-10 max-w-2xl space-y-6">
          <Badge variant="outline" className="text-primary border-primary/30 py-1 px-3">
            <Zap className="w-3 h-3 mr-1 fill-primary" />
            Social Casino Excellence
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
            WELCOME TO <br />
            <span className="text-primary">COINKRAZY AI2</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            The world's first AI-managed social casino. Play with Gold Coins or compete for Sweeps Coins in our 100% fair, AI-monitored games.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" asChild className="font-bold text-lg">
              <Link to="/slots">PLAY NOW</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="font-bold text-lg border-2">
              <Link to="/store">GET FREE SC</Link>
            </Button>
          </div>
        </div>

        {/* Background Decor */}
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
          <div className="w-full h-full bg-primary blur-[120px] rounded-full transform translate-x-1/2 -translate-y-1/2" />
        </div>
      </section>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Players', value: '4,521', icon: Users },
          { label: 'Jackpot Total', value: '52,140 SC', icon: Coins },
          { label: 'Games Live', value: '48', icon: Gamepad2 },
          { label: 'AI Status', value: 'Optimized', icon: Zap },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="p-2 bg-muted rounded-lg">
              <stat.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Games Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">FEATURED GAMES</h2>
          <Button variant="link" className="text-primary">View All Games</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game, i) => (
            <Card key={i} className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all hover:shadow-[0_0_20px_rgba(57,255,20,0.1)]">
              <CardHeader className="p-0">
                <div className={cn("h-40 flex items-center justify-center bg-gradient-to-br transition-transform group-hover:scale-105 duration-500", game.color)}>
                  <game.icon className="w-16 h-16 text-white drop-shadow-lg" />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-bold">{game.title}</CardTitle>
                  <Badge className="bg-primary/20 text-primary hover:bg-primary/20 border-none">{game.badge}</Badge>
                </div>
                <CardDescription className="text-muted-foreground line-clamp-2 min-h-[3rem]">
                  {game.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex justify-between items-center">
                <div className="flex items-center text-xs text-muted-foreground font-medium">
                  <Users className="w-3 h-3 mr-1" />
                  {game.players} online
                </div>
                <Button size="sm" asChild variant="secondary" className="font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Link to={game.path}>PLAY</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* AI Employment Notice */}
      <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shrink-0">
          <MessageSquare className="w-8 h-8 text-primary-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-lg">AI-Managed Integrity</h3>
          <p className="text-muted-foreground text-sm">
            CoinKrazyAI2 is monitored in real-time by LuckyAI and our suite of specialized AI employees.
            All gameplay, payouts, and chat are moderated for a safe and fair experience.
          </p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 md:ml-auto border-primary/20 text-primary hover:bg-primary/10">
          Meet the AI Team
        </Button>
      </section>
    </div>
  );
};

export default Index;
