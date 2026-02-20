import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Info, Star, Play, Gamepad2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeaturedGame = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900 via-yellow-900 to-amber-800 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <Badge className="bg-white/20 text-white border-none backdrop-blur-md">Featured Slot</Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
            9 Coins™ <span className="text-primary italic">1000 Edition</span>
          </h1>
          <p className="text-lg md:text-xl text-amber-100 font-medium leading-relaxed">
            Experience the popular Hold the Jackpott™ mechanic with a massive 1000x jackpot potential. 
            A masterpiece from Wazdan's legendary 9 Coins™ series.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button size="lg" className="bg-white text-amber-900 hover:bg-amber-50 font-bold" onClick={() => document.getElementById('demo-embed')?.scrollIntoView({ behavior: 'smooth' })}>
              <Play className="w-5 h-5 mr-2 fill-current" /> Play Free Demo
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <a href="https://wazdan.com/games/9-coins-1000-edition" target="_blank" rel="noopener noreferrer">
                View Official Site <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 hidden md:block">
           <div className="absolute top-10 right-10 w-64 h-64 bg-primary rounded-full blur-[100px]" />
           <div className="absolute bottom-10 right-20 w-48 h-48 bg-yellow-400 rounded-full blur-[80px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section id="demo-embed" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-primary" />
                9 Coins™ 1000 Edition Demo
              </h2>
              <Badge variant="outline" className="gap-1">
                <Shield className="w-3 h-3" /> 18+ Only
              </Badge>
            </div>
            <Card className="overflow-hidden border-2 border-primary/10 shadow-xl bg-black">
              <CardContent className="p-0 aspect-video relative">
                <iframe 
                  src="https://gamelaunch.wazdan.com/2e8g99w5/gamelauncher?operator=demo&mode=demo&game=420&platform=desktop"
                  width="100%" 
                  height="100%" 
                  title="9 Coins 1000 Edition - Wazdan" 
                  frameBorder="0" 
                  scrolling="no" 
                  allowFullScreen
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  style={{ backgroundColor: 'black' }}
                  className="w-full h-full"
                />
              </CardContent>
            </Card>
            <p className="text-xs text-center text-muted-foreground italic">
              18+ Only. Play Responsibly. Demo mode is for entertainment purposes only.
            </p>
          </section>

          <section className="prose prose-amber max-w-none bg-card p-8 rounded-2xl border border-border/50 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Game Description</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <strong>9 Coins™ 1000 Edition</strong> is an enhanced version of the original player-favorite slot. 
                This game takes the classic experience to new heights with an increased Grand Jackpot of 1000x your bet.
              </p>
              <p>
                The game features the innovative <strong>Hold the Jackpot™</strong> bonus round, which is triggered by landing 
                three bonus symbols on the middle row. Once inside, you'll find a grid of 9 independent reels where 
                the goal is to collect as many coins and special symbols as possible.
              </p>
              
              <h3 className="text-xl font-bold text-foreground mt-8 mb-4">Key Features</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Hold the Jackpot™:</strong> The signature bonus round where all the big wins happen.</li>
                <li><strong>Cash Out Label:</strong> Can appear randomly to award prizes instantly.</li>
                <li><strong>Volatility Levels™:</strong> Wazdan's unique feature allowing you to choose your preferred win frequency and size.</li>
                <li><strong>Ultra Fast Mode:</strong> For players who enjoy rapid-fire gameplay.</li>
                <li><strong>Buy Feature:</strong> Direct access to the bonus round for those who want to skip the base game.</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Game Specs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Provider</span>
                <span className="font-bold">Wazdan</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Max Win</span>
                <span className="font-bold text-primary">1000x</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Reels</span>
                <span className="font-bold">9 (3x3)</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground text-sm">Volatility</span>
                <Badge variant="outline">Adjustable</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                1. Set your bet amount using the controls at the bottom of the game.
              </p>
              <p>
                2. Select your Volatility Level (Low, Standard, or High).
              </p>
              <p>
                3. Spin the reels and aim to land 3 bonus symbols on the middle row to trigger the jackpot round.
              </p>
            </CardContent>
          </Card>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-600 to-yellow-600 text-white space-y-4 shadow-lg shadow-amber-500/20">
            <h3 className="font-bold text-lg">Looking for more?</h3>
            <p className="text-amber-50 text-sm">
              Explore our full collection of Wazdan games in the Casino section.
            </p>
            <Button className="w-full bg-white text-amber-600 hover:bg-amber-50 font-bold" asChild>
              <a href="/casino?provider=Wazdan">
                More Wazdan Games
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedGame;
