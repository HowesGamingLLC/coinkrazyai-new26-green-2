import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, Gift, Clock, Flame, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiCall } from '@/lib/api';

interface DailyLoginBonusPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimed?: () => void;
}

interface BonusData {
  day: number;
  amount_sc: number;
  amount_gc: number;
  streak: number;
  can_claim: boolean;
}

const BONUS_REWARDS = [
  { day: 1, emoji: '🎯' },
  { day: 2, emoji: '⚡' },
  { day: 3, emoji: '🔥' },
  { day: 4, emoji: '💎' },
  { day: 5, emoji: '👑' },
  { day: 6, emoji: '🌟' },
  { day: 7, emoji: '🏆' },
];

export function DailyLoginBonusPopup({
  isOpen,
  onClose,
  onClaimed,
}: DailyLoginBonusPopupProps) {
  const [bonusData, setBonusData] = useState<BonusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkBonus();
    }
  }, [isOpen]);

  const checkBonus = async () => {
    try {
      setIsLoading(true);
      const response = await apiCall<any>('/daily-login-bonus/check');
      if (response.success) {
        setBonusData(response.data);
      }
    } catch (error: any) {
      console.error('Failed to check daily bonus:', error);
      toast.error('Failed to load daily bonus');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimBonus = async () => {
    if (!bonusData || !bonusData.can_claim) return;

    try {
      setIsClaiming(true);
      const response = await apiCall<any>('/daily-login-bonus/claim', {
        method: 'POST',
      });

      if (response.success) {
        setClaimed(true);
        toast.success(`You claimed ${bonusData.amount_sc} SC and ${bonusData.amount_gc} GC!`);
        
        // Refresh profile to update balance
        setTimeout(() => {
          onClaimed?.();
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim bonus');
    } finally {
      setIsClaiming(false);
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!bonusData) return null;

  const bonusEmoji = BONUS_REWARDS.find(r => r.day === bonusData.day)?.emoji || '🎁';
  const progressPercent = (bonusData.day / 7) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md overflow-hidden">
        {/* Header with animation */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-2 text-4xl animate-bounce">✨</div>
            <div className="absolute bottom-2 right-2 text-4xl animate-pulse">🎁</div>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-2xl flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Daily Bonus
              </CardTitle>
              <CardDescription className="text-amber-100">
                Day {bonusData.day} of 7
              </CardDescription>
            </div>

            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <CardContent className="pt-6 space-y-6">
          {/* Streak Counter */}
          <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-semibold">Current Streak</span>
            </div>
            <Badge className="text-lg px-3 py-1">
              {bonusData.streak} days
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Weekly Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>

          {/* Day Display */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, idx) => {
              const day = idx + 1;
              const isCurrentDay = day === bonusData.day;
              const isPastDay = day < bonusData.day;

              return (
                <div
                  key={day}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg font-bold text-lg
                    transition-all
                    ${isCurrentDay
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary/50 scale-110'
                      : isPastDay
                      ? 'bg-green-500/20 text-green-700 border border-green-500/30'
                      : 'bg-muted text-muted-foreground border border-border'
                    }
                  `}
                >
                  {BONUS_REWARDS[idx].emoji}
                </div>
              );
            })}
          </div>

          {/* Bonus Amount */}
          <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 p-6 rounded-lg text-center space-y-3">
            <p className="text-sm text-muted-foreground font-semibold">TODAY'S REWARD</p>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                <p className="text-3xl font-black text-primary">
                  {bonusData.amount_sc.toFixed(2)}
                </p>
                <span className="text-primary font-bold">SC</span>
              </div>
              <p className="text-sm text-muted-foreground">
                + {bonusData.amount_gc.toLocaleString()} GC
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg text-sm text-blue-700">
            <p className="font-semibold mb-2">💡 Pro Tip:</p>
            <p>Keep your streak going! Claim your bonus every 24 hours to earn bigger rewards.</p>
          </div>

          {/* Action Button */}
          {!claimed ? (
            <Button
              onClick={handleClaimBonus}
              disabled={!bonusData.can_claim || isClaiming}
              className="w-full text-lg font-bold py-6"
            >
              {isClaiming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : !bonusData.can_claim ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Already Claimed Today
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Claim Bonus
                </>
              )}
            </Button>
          ) : (
            <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-lg text-center">
              <p className="text-green-700 font-bold">✓ Bonus Claimed!</p>
              <p className="text-sm text-green-600 mt-1">Come back tomorrow for your next bonus</p>
            </div>
          )}

          {/* Close Button */}
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
