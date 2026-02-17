import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Trophy, Star, Zap, Flame, Calendar, ShoppingBag, Target, Sparkles, CheckCircle2 } from 'lucide-react';
import { apiCall } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Challenge {
  id: number;
  type: 'daily_login' | 'purchase' | 'spins' | 'streak';
  name: string;
  description: string;
  requirement_count: number;
  current_count: number;
  is_completed: boolean;
  reward_sc: number;
  reward_gc: number;
  reward_badge?: string;
  reward_vip_status?: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
}

interface ChallengesPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChallengesPopup: React.FC<ChallengesPopupProps> = ({ isOpen, onClose }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'daily' | 'weekly' | 'streaks'>('all');

  useEffect(() => {
    if (isOpen) {
      fetchChallenges();
    }
  }, [isOpen]);

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const response = await apiCall<{ success: boolean; data?: Challenge[] }>('/challenges');
      if (response.success) {
        setChallenges(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async (challengeId: number) => {
    try {
      const response = await apiCall<{ success: boolean; message?: string }>('/challenges/claim', {
        method: 'POST',
        body: JSON.stringify({ challengeId }),
      });
      if (response.success) {
        toast.success(response.message || 'Reward claimed! 🎉');
        fetchChallenges(); // Refresh list
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim reward');
    }
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'daily_login': return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'purchase': return <ShoppingBag className="w-5 h-5 text-green-500" />;
      case 'spins': return <Target className="w-5 h-5 text-purple-500" />;
      case 'streak': return <Flame className="w-5 h-5 text-orange-500" />;
      default: return <Star className="w-5 h-5 text-yellow-500" />;
    }
  };

  const filteredChallenges = challenges.filter(c => {
    if (activeTab === 'all') return true;
    if (activeTab === 'daily') return c.period === 'daily';
    if (activeTab === 'weekly') return c.period === 'weekly';
    if (activeTab === 'streaks') return c.type === 'streak';
    return true;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.4)] bg-slate-950 text-white p-0">
        <div className="sticky top-0 z-10 bg-slate-900 p-6 border-b border-white/10">
          <DialogHeader className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <div className="bg-yellow-500 p-3 rounded-full shadow-lg shadow-yellow-500/50">
                <Trophy className="w-8 h-8 text-slate-950" />
              </div>
            </div>
            <DialogTitle className="text-4xl font-black italic tracking-tighter bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent uppercase">
              COINKRAZY CHALLENGES
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">
              Complete challenges to earn massive rewards & VIP status!
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 justify-center">
            {(['all', 'daily', 'weekly', 'streaks'] as const).map(tab => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "capitalize font-black italic text-xs h-8 px-4",
                  activeTab === tab ? "bg-yellow-500 text-slate-950 hover:bg-yellow-400" : "border-white/10 text-white hover:bg-white/5"
                )}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
              <p className="font-black italic text-yellow-500 animate-pulse">LOADING YOUR CHALLENGES...</p>
            </div>
          ) : filteredChallenges.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl">
              <Sparkles className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 font-bold uppercase">No challenges found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredChallenges.map(challenge => (
                <Card 
                  key={challenge.id} 
                  className={cn(
                    "border-2 transition-all duration-300 relative overflow-hidden group",
                    challenge.is_completed 
                      ? "bg-green-500/10 border-green-500/50" 
                      : "bg-white/5 border-white/10 hover:border-yellow-500/50"
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-slate-900 p-2 rounded-lg border border-white/10">
                        {getChallengeIcon(challenge.type)}
                      </div>
                      <Badge className={cn(
                        "font-black text-[10px] uppercase italic",
                        challenge.period === 'daily' ? "bg-blue-600" :
                        challenge.period === 'weekly' ? "bg-purple-600" :
                        challenge.period === 'monthly' ? "bg-orange-600" : "bg-slate-600"
                      )}>
                        {challenge.period}
                      </Badge>
                    </div>

                    <h3 className="font-black text-lg leading-tight mb-1 uppercase italic group-hover:text-yellow-400 transition-colors">
                      {challenge.name}
                    </h3>
                    <p className="text-xs text-slate-400 mb-4 font-bold line-clamp-2">
                      {challenge.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>Progress</span>
                        <span>{challenge.current_count} / {challenge.requirement_count}</span>
                      </div>
                      <Progress 
                        value={(challenge.current_count / challenge.requirement_count) * 100} 
                        className="h-2 bg-slate-900"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-slate-500 mb-1">Rewards</span>
                        <div className="flex flex-wrap gap-1">
                          {challenge.reward_sc > 0 && (
                            <Badge className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 font-black text-[10px]">
                              {challenge.reward_sc} SC
                            </Badge>
                          )}
                          {challenge.reward_gc > 0 && (
                            <Badge className="bg-slate-700 text-slate-300 border border-white/5 font-black text-[10px]">
                              {challenge.reward_gc} GC
                            </Badge>
                          )}
                          {challenge.reward_badge && (
                            <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/20 font-black text-[10px]">
                              {challenge.reward_badge}
                            </Badge>
                          )}
                          {challenge.reward_vip_status && (
                            <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-none font-black text-[10px]">
                              {challenge.reward_vip_status} VIP
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        disabled={challenge.current_count < challenge.requirement_count || challenge.is_completed}
                        onClick={() => handleClaim(challenge.id)}
                        className={cn(
                          "font-black uppercase italic text-xs px-4 h-9 shadow-lg",
                          challenge.is_completed 
                            ? "bg-green-600/20 text-green-500 border border-green-500/20" 
                            : challenge.current_count >= challenge.requirement_count
                              ? "bg-yellow-500 text-slate-950 hover:bg-yellow-400 animate-bounce"
                              : "bg-slate-800 text-slate-500 border border-white/5"
                        )}
                      >
                        {challenge.is_completed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          "Claim"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                  
                  {/* Completed Overlay */}
                  {challenge.is_completed && (
                    <div className="absolute inset-0 bg-green-500/5 pointer-events-none flex items-center justify-center">
                      <div className="rotate-[-12deg] border-4 border-green-500/30 rounded-xl px-4 py-1">
                        <span className="text-3xl font-black text-green-500/20 uppercase">COMPLETED</span>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-900 border-t border-white/10 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
            Check back daily for new challenges & special events!
          </p>
          <Button 
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 text-white font-black uppercase italic text-xs"
          >
            Let's Play!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
