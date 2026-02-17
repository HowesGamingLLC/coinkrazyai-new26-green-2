import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { bingo } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, Trophy, AlertCircle, RefreshCw, Zap, Sparkles, Clock, Star } from 'lucide-react';
import { toast } from 'sonner';
import { BingoGame } from '@shared/api';
import { cn } from '@/lib/utils';

const Bingo = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<BingoGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasingTickets, setPurchasingTickets] = useState<Set<number>>(new Set());
  const [activeGame, setActiveGame] = useState<BingoGame | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchGames = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await bingo.getRooms();
        if (response.success) {
          setGames(response.data || []);
        } else {
          setError('Failed to load bingo rooms');
        }
      } catch (error: any) {
        const message = error.message || 'Failed to load bingo games';
        console.error('Failed to fetch bingo games:', error);
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchGames();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleBuyTicket = async (gameId: number) => {
    setPurchasingTickets(prev => new Set([...prev, gameId]));
    try {
      const response = await bingo.buyTicket(gameId);
      if (response.success) {
        toast.success('Ticket purchased! Game starting soon... 🎟️');
        // Refresh the games list
        const updatedResponse = await bingo.getRooms();
        if (updatedResponse.success) {
          setGames(updatedResponse.data || []);
        }
      } else {
        toast.error('Failed to purchase ticket');
      }
    } catch (error: any) {
      const message = error.message || 'Failed to purchase ticket';
      toast.error(message);
    } finally {
      setPurchasingTickets(prev => {
        const newSet = new Set(prev);
        newSet.delete(gameId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
        <p className="font-black italic text-purple-500 animate-pulse tracking-widest uppercase">Initializing Bingo Hall...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* High-Impact Bingo Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 md:p-12 border-4 border-purple-500/30 shadow-[0_0_80px_rgba(168,85,247,0.15)] group">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1">
              <Sparkles className="w-4 h-4 text-purple-500 animate-spin-slow" />
              <span className="text-purple-500 font-black uppercase text-[10px] tracking-widest">Jackpot Central</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic text-white uppercase leading-none">
              BINGO <span className="text-purple-500">MANIA</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-tight max-w-md text-sm">
              Multiple rooms, massive jackpots, and live caller action 24/7!
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
             <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 text-center min-w-[160px] shadow-2xl">
               <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
               <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Daily Jackpot</p>
               <p className="text-3xl font-black text-white italic">25,000 SC</p>
             </div>
             <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 text-center min-w-[160px] shadow-2xl">
               <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
               <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Players Live</p>
               <p className="text-3xl font-black text-purple-500 italic">1,245</p>
             </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-950 border-red-500 text-red-200 rounded-2xl border-2">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="flex items-center justify-between font-bold uppercase text-xs">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="ml-4 border-red-500 text-red-500 hover:bg-red-500/10 font-black italic"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              RETRY
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Bingo Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map(game => (
          <Card 
            key={game.id} 
            className="bg-slate-950 border-4 border-white/5 overflow-hidden group hover:border-purple-500/40 transition-all duration-500 rounded-[2rem] shadow-2xl"
          >
            <CardHeader className="p-0">
               <div className="bg-gradient-to-br from-purple-600 to-blue-700 p-6 text-white relative overflow-hidden">
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter">{game.name}</h3>
                      <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Pattern: {game.pattern}</p>
                    </div>
                    <Badge className="bg-white/20 text-white border-none font-black italic text-[10px] px-3">
                      {game.status}
                    </Badge>
                  </div>
                  <div className="absolute -right-6 -bottom-6 opacity-20 transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
                    <Zap className="w-32 h-32" />
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">Ticket Price</p>
                  <p className="text-xl font-black text-white italic">{Number(game.ticket_price ?? 0).toFixed(2)} SC</p>
                </div>
                <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">Active Players</p>
                  <p className="text-xl font-black text-purple-500 italic">{game.players}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                   <span className="text-[10px] font-black text-slate-500 uppercase italic">Next Jackpot</span>
                   <span className="text-sm font-black text-yellow-500 italic flex items-center gap-1">
                     <Star className="w-3 h-3 fill-yellow-500" />
                     {Number(game.jackpot ?? 0).toLocaleString()} SC
                   </span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                   <div className="h-full bg-purple-600 w-2/3 animate-pulse" />
                </div>
              </div>

              <Button
                onClick={() => handleBuyTicket(game.id)}
                disabled={purchasingTickets.has(game.id)}
                className="w-full h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-black text-xl italic rounded-2xl shadow-xl shadow-purple-500/20 border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 transition-all uppercase"
              >
                {purchasingTickets.has(game.id) ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    JOINING...
                  </>
                ) : (
                  'GET TICKETS'
                )}
              </Button>
            </CardContent>
            <div className="bg-slate-900/50 p-3 border-t border-white/5 flex items-center justify-center gap-2">
               <Clock className="w-3 h-3 text-slate-600" />
               <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Game starts in 01:45</span>
            </div>
          </Card>
        ))}
      </div>

      {games.length === 0 && (
        <Card className="bg-slate-950 border-4 border-dashed border-white/5 rounded-[3rem] py-20">
          <CardContent className="text-center space-y-4">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto border-2 border-white/10">
               <Zap className="w-10 h-10 text-slate-700" />
            </div>
            <div>
              <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Rooms Under Maintenance</h3>
              <p className="text-slate-500 font-bold uppercase text-xs">Our AI managers are resetting the bingo cards. Check back in a flash!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bingo Promotion */}
      <section className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-2 border-purple-500/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 rounded-[2rem] bg-purple-600 flex items-center justify-center shrink-0 shadow-2xl transform -rotate-12 group hover:rotate-0 transition-transform">
          <Star className="w-12 h-12 text-white fill-white animate-pulse" />
        </div>
        <div className="space-y-2 flex-1 text-center md:text-left">
          <h3 className="font-black text-3xl italic uppercase text-white tracking-tighter">BINGO LOYALTY PROGRAM</h3>
          <p className="text-slate-400 font-bold uppercase text-sm leading-relaxed max-w-2xl">
            Play 50 games of bingo this week to earn a <span className="text-purple-500">FREE 20.00 SC</span> bonus and the exclusive <span className="text-blue-500">"Bingo Shark"</span> badge!
          </p>
        </div>
        <Button className="bg-white text-purple-900 font-black italic uppercase rounded-xl px-8 h-12">LEARN MORE</Button>
      </section>
    </div>
  );
};

export default Bingo;
