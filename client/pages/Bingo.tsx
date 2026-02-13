import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Timer, Ticket, Zap } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';
import { toast } from '@/hooks/use-toast';

const Bingo = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const { wallet, currency } = useWallet();

  useEffect(() => {
    fetch('/api/bingo/rooms')
      .then(res => res.json())
      .then(res => {
        if (res.success) setRooms(res.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleJoin = (room: any) => {
    if (currency !== 'SC') {
      toast({ title: "SC Only", description: "Bingo is exclusive to Sweeps Coins.", variant: "destructive" });
      return;
    }
    setSelectedRoom(room);
  };

  if (selectedRoom) {
    return <BingoRoom room={selectedRoom} onLeave={() => setSelectedRoom(null)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-primary/20 text-primary border-none">
            <Trophy className="w-3 h-3 mr-1" /> $25k Monthly Bingo Leaderboard
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">BINGO <span className="text-primary">HALL</span></h1>
          <p className="text-muted-foreground font-medium text-lg">Auto-daub enabled. Rolling jackpots. 75-Ball classic.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-3xl" />)
        ) : (
          rooms.map((room) => (
            <Card 
              key={room.id} 
              className="relative overflow-hidden group border-border/50 hover:border-primary transition-all flex flex-col"
            >
              <div className="absolute top-0 right-0 p-3">
                <Badge className="bg-primary/10 text-primary border-none">{room.ticketPrice} SC</Badge>
              </div>
              
              <CardHeader className="text-center pt-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Ticket className="text-muted-foreground group-hover:text-primary w-8 h-8" />
                </div>
                <CardTitle className="text-2xl font-bold">{room.name}</CardTitle>
                <div className="flex items-center justify-center gap-4 text-xs font-bold text-muted-foreground uppercase mt-2">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {room.players}</span>
                  <span className="flex items-center gap-1 text-primary"><Timer className="w-3 h-3" /> {room.nextGameIn}s</span>
                </div>
              </CardHeader>

              <CardContent className="text-center flex-1">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Jackpot</p>
                <p className="text-3xl font-black text-primary">{room.jackpot} SC</p>
              </CardContent>

              <div className="p-6 pt-0">
                <Button onClick={() => handleJoin(room)} className="w-full font-bold h-12">PLAY NOW</Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const BingoRoom = ({ room, onLeave }: any) => {
  const [calledBalls, setCalledBalls] = useState<number[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [gameStarted, setGameStarted] = useState(false);

  const buyTicket = async () => {
    const res = await fetch('/api/bingo/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: room.id, count: 1 })
    });
    const data = await res.json();
    if (data.success) {
      setMyTickets([...myTickets, ...data.data.tickets]);
      toast({ title: "Ticket Purchased", description: "Good luck!" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onLeave}>Leave Hall</Button>
          <h2 className="text-2xl font-black italic">{room.name}</h2>
        </div>
        <Badge className="bg-primary/10 text-primary border-none text-lg py-1 px-4">JACKPOT: {room.jackpot} SC</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Game Board */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-muted/30 border border-border p-8 rounded-3xl min-h-[400px] flex flex-col items-center justify-center relative">
            {!gameStarted && (
              <div className="text-center space-y-6">
                <Timer className="w-16 h-16 text-primary mx-auto animate-pulse" />
                <h3 className="text-2xl font-bold">NEXT GAME STARTING SOON</h3>
                <p className="text-muted-foreground">Buy your tickets now to participate in this round!</p>
                <div className="flex justify-center gap-4">
                  <Button size="lg" onClick={buyTicket} className="font-bold h-16 px-12 text-xl">
                    BUY TICKET (1 SC)
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {myTickets.map((ticket, idx) => (
              <Card key={idx} className="border-primary/20 bg-background overflow-hidden">
                <div className="bg-primary/10 p-2 text-center text-[10px] font-black tracking-widest uppercase">My Ticket #{idx + 1}</div>
                <CardContent className="p-4">
                  <div className="grid grid-cols-5 gap-1">
                    {['B', 'I', 'N', 'G', 'O'].map(l => (
                      <div key={l} className="text-center font-black text-primary text-sm mb-2">{l}</div>
                    ))}
                    {ticket.map((col: number[], colIdx: number) => (
                      <div key={colIdx} className="space-y-1">
                        {col.map((num, rowIdx) => (
                          <div 
                            key={rowIdx} 
                            className={cn(
                              "aspect-square flex items-center justify-center text-xs font-bold border border-border rounded-lg",
                              num === 0 ? "bg-primary text-primary-foreground" : "bg-muted/50"
                            )}
                          >
                            {num === 0 ? 'FREE' : num}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Called Balls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                    ?
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Live Chat</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex flex-col justify-end gap-3">
              <div className="space-y-2 text-sm">
                <p><span className="font-bold text-primary">LuckyAI:</span> Welcome to the hall! Good luck everyone!</p>
                <p><span className="font-bold text-blue-400">SocialAI:</span> Let's keep the chat clean and krazy!</p>
                <p><span className="font-bold text-muted-foreground">Player123:</span> Almost had it last time!</p>
              </div>
              <div className="flex gap-2">
                <input className="bg-muted border border-border rounded-lg px-3 py-2 text-sm flex-1" placeholder="Type message..." />
                <Button size="sm">Send</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Bingo;
