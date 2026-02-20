import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Info, Star, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MicrogamingSlots = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <Badge className="bg-white/20 text-white border-none backdrop-blur-md">Featured Provider</Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
            Microgaming <span className="text-primary italic">Slots</span>
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 font-medium leading-relaxed">
            Experience the industry's most extensive collection of premium casino games, 
            featuring legendary titles like Thunderstruck II and Mega Moolah.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold" onClick={() => document.getElementById('demo-embed')?.scrollIntoView({ behavior: 'smooth' })}>
              <Play className="w-5 h-5 mr-2 fill-current" /> Play Free Demos
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <a href="https://vegashero.co/game-providers/microgaming-games/" target="_blank" rel="noopener noreferrer">
                View Official Site <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 hidden md:block">
           <div className="absolute top-10 right-10 w-64 h-64 bg-primary rounded-full blur-[100px]" />
           <div className="absolute bottom-10 right-20 w-48 h-48 bg-blue-400 rounded-full blur-[80px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section id="demo-embed" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-primary" />
                Demo Games Library
              </h2>
              <Badge variant="outline">Powered by VegasHero</Badge>
            </div>
            <Card className="overflow-hidden border-2 border-primary/10 shadow-xl bg-card/50 backdrop-blur">
              <CardContent className="p-0 aspect-video">
                <iframe 
                  sandbox="allow-scripts" 
                  security="restricted" 
                  src="https://vegashero.co/game-providers/microgaming-games/embed/#?secret=qrIc0UhoAs" 
                  width="100%" 
                  height="100%" 
                  title="“Microgaming Games – Demo Slots” — VegasHero" 
                  data-secret="qrIc0UhoAs" 
                  frameBorder="0" 
                  marginWidth={0} 
                  marginHeight={0} 
                  scrolling="no" 
                  className="w-full h-full"
                />
              </CardContent>
            </Card>
          </section>

          <section className="prose prose-indigo max-w-none bg-card p-8 rounded-2xl border border-border/50 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">About Microgaming</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Microgaming is a software company that creates the most slots games in the industry by volume. 
                They are one of the largest and most well-known providers of online casino software in the world. 
                Microgaming has created some of the most popular slots games played today, including Thunderstruck, 
                Mega Moolah, and Avalon II.
              </p>
              <p>
                Recently, the Microgaming casino and slots game portfolio that was distributed by their Quickfire 
                platform, got acquired by a new private company called Games Global Limited. With this acquisition 
                they gained access to a large audience base through more than 900 gaming brands that use these slots 
                and casino games.
              </p>
              <p>
                At this point it's unclear if the existing slot portfolio will be re-branded to Games Global from 
                Microgaming. The official Microgaming.co.uk website removed their demo game library section as a 
                whole and we are hoping that Games Global will continue to update their site and frequently 
                release new game titles.
              </p>
              
              <h3 className="text-xl font-bold text-foreground mt-8 mb-4">Why Microgaming is the Top Choice?</h3>
              <p>
                As a casino affiliate, you want to make sure you're working with the best in the business. 
                That's why you should consider partnering with Microgaming. Microgaming works with the top 
                iGaming studios to bring you the latest and greatest casino games on the market. With 
                Microgaming, you'll be able to offer your players an unbeatable gaming experience that 
                they won't find anywhere else.
              </p>
              
              <div className="bg-muted/50 p-6 rounded-xl border border-border/50 my-8">
                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  Collaborating Gaming Studios
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-sm">
                  {['Alchemy Gaming', 'All41 Studios', 'Crazy Tooth Studio', 'Fortune Factory Studios', 'Gameburger Studios', 'Gold Coin Studios', 'Just For The Win', 'Neon Valley Studios', 'Neko Games', 'Pulse 8 Studios', 'Slingshot Studios', 'Snowborn Games', 'SpinPlay Games', 'Stormcraft Studios', 'Triple Edge Studios'].map(studio => (
                    <div key={studio} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {studio}
                    </div>
                  ))}
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground mt-8 mb-4">Advantages of Working with Microgaming</h3>
              <p>
                For starters, Microgaming has a long-standing reputation in the industry for being a trusted and 
                reliable partner. They've been in business for over 20 years, so they know a thing or two about 
                what it takes to be successful in this industry.
              </p>
              <p>
                When you partner with Microgaming, you can rest assured that you're partnering with a company 
                that is committed to your success. In addition to their reputation, another advantage is that 
                they offer exclusive promotional offers and around-the-clock support.
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Years in Business</span>
                <span className="font-bold">20+</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Gaming Brands</span>
                <span className="font-bold">900+</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Total Games</span>
                <span className="font-bold">800+</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground text-sm">Provider</span>
                <Badge variant="secondary">VegasHero</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Why Play Demos?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                When you play free to play demo slots games, you're not risking any of your own money. 
                This is a great way to try out new games and see which ones you like before you wager 
                any real money on them.
              </p>
              <p>
                It's also a good way to get a feel for how online slots work and what the odds are of 
                winning on each game. Learn about bonus features and special mechanics without risk.
              </p>
            </CardContent>
          </Card>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white space-y-4">
            <h3 className="font-bold text-lg">Are you a website owner?</h3>
            <p className="text-indigo-100 text-sm">
              Embed these free-to-play Microgaming demo slots games on your site using the VegasHero Casino Wordpress Plugin.
            </p>
            <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold" asChild>
              <a href="https://vegashero.co/wp-casino-plugin/" target="_blank" rel="noopener noreferrer">
                Get Plugin
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { Gamepad2 } from 'lucide-react';

export default MicrogamingSlots;
