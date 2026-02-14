import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Coins, ArrowRight, ShieldCheck, Loader } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';
import { toast } from '@/hooks/use-toast';
import { PokerTable } from '@shared/api';
import { ApiClient } from '@/lib/api';
import { io } from 'socket.io-client';

const Poker = () => {
  const [tables, setTables] = useState<PokerTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<PokerTable | null>(null);
  const [joinBuyIn, setJoinBuyIn] = useState<number>(0);
  const [isJoining, setIsJoining] = useState(false);
  const { wallet, refreshWallet } = useWallet();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await ApiClient.getPokerTables();
        if (res.success && res.data) {
          setTables(res.data);
        } else {
          toast({ title: 'Error', description: 'Failed to load poker tables', variant: 'destructive' });
        }
      } catch (error) {
        console.error('Failed to fetch poker tables:', error);
        toast({ title: 'Error', description: 'Failed to load tables', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTables();
  }, []);

  const handleJoinTable = async (table: PokerTable) => {
    setSelectedTable(table);
    setJoinBuyIn(table.buy_in_min);
  };

  const handleConfirmJoin = async (table: PokerTable, buyIn: number) => {
    if (!wallet) {
      toast({ title: 'Error', description: 'Wallet not loaded', variant: 'destructive' });
      return;
    }

    if (wallet.sweepsCoins < buyIn) {
      toast({
        title: 'Insufficient Balance',
        description: `You need ${buyIn} SC. You have ${wallet.sweepsCoins}`,
        variant: 'destructive'
      });
      return;
    }

    setIsJoining(true);
    try {
      const res = await ApiClient.joinPokerTable(table.id, buyIn);

      if (res.success) {
        toast({
          title: 'Joined Table!',
          description: `Welcome to ${table.name}. Good luck!`
        });

        // Connect to socket.io
        const socket = io();
        socket.emit('poker:join_table', {
          tableId: table.id,
          playerId: wallet.id,
          buyIn
        });

        refreshWallet();
        // Show actual poker game here
        setSelectedTable(null);
      } else {
        toast({
          title: 'Error',
          description: res.error || 'Failed to join table',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Join table error:', error);
      toast({
        title: 'Error',
        description: 'Failed to join table',
        variant: 'destructive'
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (selectedTable) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black">{selectedTable.name}</h2>
          <Button variant="outline" onClick={() => setSelectedTable(null)}>
            Back to Lobby
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Join Table</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Buy-In Amount (SC)</p>
              <input
                type="number"
                min={selectedTable.buy_in_min}
                max={selectedTable.buy_in_max}
                value={joinBuyIn}
                onChange={(e) => setJoinBuyIn(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-border rounded-lg bg-muted/30"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Minimum: {selectedTable.buy_in_min} SC | Maximum: {selectedTable.buy_in_max} SC
              </p>
            </div>

            <Button
              onClick={() => handleConfirmJoin(selectedTable, joinBuyIn)}
              disabled={isJoining || !wallet || wallet.sweepsCoins < joinBuyIn}
              className="w-full h-12 font-bold"
            >
              {isJoining ? <Loader className="w-5 h-5 animate-spin mr-2" /> : null}
              Join Table
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading poker tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-primary/20 text-primary border-none">
            <ShieldCheck className="w-3 h-3 mr-1" /> AI Anti-Collusion Active
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">POKER <span className="text-primary">LOBBY</span></h1>
          <p className="text-muted-foreground font-medium text-lg">
            {tables.length} tables available • Real-money Texas Hold'em
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <span>Table Name</span>
            <div className="flex gap-12 mr-12">
              <span>Buy-In Range</span>
              <span>Players</span>
            </div>
          </div>

          <div className="space-y-3">
            {tables.length > 0 ? (
              tables.map((table) => (
                <Card
                  key={table.id}
                  className="group hover:border-primary/50 transition-all cursor-pointer border-border/50 bg-muted/20"
                  onClick={() => handleJoinTable(table)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <Coins className="text-muted-foreground group-hover:text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{table.name}</h3>
                          <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">
                            {table.stakes}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-12">
                        <div className="text-right">
                          <p className="font-mono font-bold text-sm">
                            {table.buy_in_min} - {table.buy_in_max}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">SC</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-bold text-sm">
                            {table.current_players}/{table.max_players}
                          </span>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full group-hover:bg-primary group-hover:text-primary-foreground"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No tables available at this time</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Live Table Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Total Pot Volume</span>
                <span className="font-bold">12,450 SC</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Biggest Pot (24h)</span>
                <span className="font-bold text-primary">1,240 SC</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">AI Watchdog</span>
                <Badge className="bg-green-500/10 text-green-500 border-none">Active</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Recent Big Winners</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Sharky99', win: '450.00 SC' },
                { name: 'PokerAI_8', win: '320.50 SC' },
                { name: 'AceHigh', win: '210.00 SC' },
              ].map((w, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                      {w.name[0]}
                    </div>
                    <span className="text-sm font-medium">{w.name}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{w.win}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const PokerTable = ({ table, onLeave }: any) => {
  return (
    <div className="fixed inset-0 z-50 bg-background p-4 md:p-8 flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onLeave}>Leave Table</Button>
          <div>
            <h2 className="text-2xl font-black italic">{table.name}</h2>
            <p className="text-xs text-muted-foreground font-bold uppercase">JoseyAI Monitoring Enabled</p>
          </div>
        </div>
        <div className="bg-muted px-6 py-2 rounded-full border border-border">
          <span className="text-xs font-bold text-muted-foreground uppercase mr-2">POT:</span>
          <span className="text-xl font-black text-primary">0.00 SC</span>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        {/* The Poker Table */}
        <div className="w-full max-w-5xl aspect-[2/1] bg-[#1a3a3a] border-[12px] border-[#3a2a1a] rounded-[200px] relative shadow-2xl flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 border-[2px] border-white/10 rounded-[188px] m-4" />
          
          {/* Logo on felt */}
          <div className="opacity-10 text-6xl font-black tracking-tighter select-none">COINKRAZY AI2</div>

          {/* Player Seats (Simplified) */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div 
              key={i} 
              className="absolute w-24 h-24 flex flex-col items-center gap-2"
              style={{
                top: `${50 + 40 * Math.sin((i * 45) * Math.PI / 180)}%`,
                left: `${50 + 45 * Math.cos((i * 45) * Math.PI / 180)}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="w-14 h-14 bg-muted border-2 border-border rounded-full flex items-center justify-center font-bold text-xs">
                P{i + 1}
              </div>
              <div className="bg-black/50 px-2 py-0.5 rounded text-[10px] font-bold">100.00 SC</div>
            </div>
          ))}

          {/* Community Cards */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-12 h-16 bg-white/5 border border-white/10 rounded flex items-center justify-center text-white/20">
                ?
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 bg-muted p-6 rounded-3xl border border-border flex items-center justify-center gap-4">
        <Button variant="outline" size="lg" className="px-8 font-bold">FOLD</Button>
        <Button variant="outline" size="lg" className="px-8 font-bold">CHECK</Button>
        <Button size="lg" className="px-12 font-black italic">CALL</Button>
        <div className="h-10 w-px bg-border mx-4" />
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="font-bold">BET 10</Button>
          <Button variant="secondary" className="font-bold">BET 50</Button>
          <Button variant="secondary" className="font-bold">ALL IN</Button>
        </div>
      </div>
    </div>
  );
};

export default Poker;
