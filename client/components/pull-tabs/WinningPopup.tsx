import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Gift, Sparkles } from 'lucide-react';

interface WinningPopupProps {
  isOpen: boolean;
  winAmount: number;
  onClaim: () => Promise<void>;
  onClose: () => void;
  isClaiming: boolean;
}

export const WinningPopup: React.FC<WinningPopupProps> = ({
  isOpen,
  winAmount,
  onClaim,
  onClose,
  isClaiming,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-orange-400">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 bg-orange-300 rounded-full animate-pulse opacity-30" />
              <div className="absolute inset-2 bg-orange-200 rounded-full animate-pulse opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-orange-500 animate-bounce" />
              </div>
            </div>
          </div>

          <DialogTitle className="text-5xl font-black bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-clip-text text-transparent uppercase tracking-tighter animate-pulse">
            WINNER!
          </DialogTitle>

          <DialogDescription className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {winAmount ? winAmount.toFixed(2) : '0.00'} SC!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Prize Amount Display */}
          <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40 rounded-xl p-8 text-center border-4 border-orange-400 dark:border-red-600 shadow-2xl transform hover:scale-105 transition-transform">
            <p className="text-sm font-black text-orange-800 dark:text-orange-200 uppercase tracking-widest mb-2">Instant Win!</p>
            <p className="text-6xl font-black text-orange-600 dark:text-orange-400 drop-shadow-md">
              {winAmount ? winAmount.toFixed(2) : '0.00'}
            </p>
            <p className="text-xl font-black text-gray-800 dark:text-gray-200 mt-2">
              Sweeps Coins (SC)
            </p>
          </div>

          {/* Celebration Message */}
          <div className="text-center space-y-2">
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Congratulations! You revealed a winner!
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click the big button below to claim your instant win now!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isClaiming}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={onClaim}
              disabled={isClaiming}
              className="flex-1 h-20 text-2xl font-black bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 hover:from-orange-500 hover:to-red-600 shadow-xl shadow-red-500/40 border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all uppercase"
            >
              {isClaiming ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 mr-2" />
                  CLAIM NOW!
                </>
              )}
            </Button>
          </div>

          {/* Celebration Animation Text */}
          <div className="text-center text-2xl">
            🎊 🎈 🎁 🎉 🏆
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
