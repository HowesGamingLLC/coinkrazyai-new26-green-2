import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Hammer, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PoolShark = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-4">
      <Button variant="ghost" asChild className="mb-8 hover:bg-slate-100">
        <Link to="/">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lobby
        </Link>
      </Button>

      <Card className="border-8 border-slate-900 shadow-[0_0_100px_rgba(59,130,246,0.2)] overflow-hidden bg-slate-950">
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />
        
        <CardContent className="p-12 md:p-20 text-center space-y-12">
          <div className="relative inline-block">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-slate-900 rounded-full flex items-center justify-center mx-auto border-4 border-white/10 shadow-2xl animate-pulse">
              <Trophy className="w-16 h-16 md:w-24 md:h-24 text-blue-500" />
            </div>
            <div className="absolute -top-4 -right-4 bg-yellow-500 text-slate-950 font-black px-4 py-1 rounded-full text-xs rotate-12 shadow-xl">
              COMING SOON
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase leading-none">
              POOL <br />
              <span className="text-blue-500">SHARK</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 font-bold uppercase tracking-tight italic max-w-xl mx-auto">
              The World's First AI-Driven Multiplayer Billiards Arena
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
             <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
                <Hammer className="w-8 h-8 text-blue-400 mx-auto" />
                <p className="font-black text-xs uppercase tracking-widest text-slate-300">Under Construction</p>
             </div>
             <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
                <Clock className="w-8 h-8 text-indigo-400 mx-auto" />
                <p className="font-black text-xs uppercase tracking-widest text-slate-300">Launching Winter 2025</p>
             </div>
             <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
                <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
                <p className="font-black text-xs uppercase tracking-widest text-slate-300">AI-Powered Physics</p>
             </div>
          </div>

          <div className="pt-8 border-t border-white/5">
             <p className="text-slate-500 font-bold uppercase text-sm mb-6">Want to be the first to play?</p>
             <Button size="lg" className="h-16 px-12 bg-blue-600 hover:bg-blue-700 text-white font-black text-xl italic rounded-2xl shadow-xl shadow-blue-500/20">
                JOIN THE WAITLIST
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PoolShark;
