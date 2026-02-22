import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Gift, Sparkles, Share2, Facebook } from 'lucide-react';
import { toast } from 'sonner';
import { apiCall } from '@/lib/api';

interface WinningPopupProps {
  isOpen: boolean;
  winAmount: number;
  gameName?: string;
  gameId?: number;
  onClaim: () => Promise<void>;
  onClose: () => void;
  isClaiming: boolean;
}

export const WinningPopup: React.FC<WinningPopupProps> = ({
  isOpen,
  winAmount,
  gameName = 'CoinKrazy',
  gameId,
  onClaim,
  onClose,
  isClaiming,
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  const generateShareMessage = (): string => {
    const game = gameName || 'CoinKrazy';
    return `🎉 I just won ${winAmount} SC playing ${game} on CoinKrazy Social Casino! 🎰 Join me and win big! 💰 https://coinkrazy.io`;
  };

  const handleFacebookShare = async () => {
    try {
      setIsSharing(true);
      const message = generateShareMessage();

      // Record the share in the database
      const response = await apiCall<any>('/social/share', {
        method: 'POST',
        body: JSON.stringify({
          gameId: gameId || null,
          winAmount,
          gameName: gameName || 'Unknown Game',
          platform: 'facebook',
          message,
          shareLink: window.location.href,
        }),
      });

      if (response.success) {
        // Use Facebook SDK if available, otherwise open share dialog
        if ((window as any).FB && (window as any).FB.ui) {
          (window as any).FB.ui(
            {
              method: 'share',
              href: 'https://coinkrazy.io',
              quote: message,
              hashtag: '#CoinKrazy',
            },
            function (response: any) {
              if (response && !response.error_code) {
                setHasShared(true);
                toast.success('Thanks for sharing! 🎊');
              }
            }
          );
        } else {
          // Fallback: open Facebook share dialog
          const encodedMessage = encodeURIComponent(message);
          const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=https://coinkrazy.io&quote=${encodedMessage}`;
          window.open(facebookShareUrl, 'facebook-share', 'width=600,height=400');
          setHasShared(true);
          toast.success('Thanks for sharing! 🎊');
        }
      }
    } catch (error) {
      console.error('Failed to share:', error);
      toast.error('Failed to share on Facebook');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-yellow-400">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 bg-yellow-300 rounded-full animate-pulse opacity-30" />
              <div className="absolute inset-2 bg-yellow-200 rounded-full animate-pulse opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-yellow-500 animate-bounce" />
              </div>
            </div>
          </div>

          <DialogTitle className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent uppercase tracking-tighter animate-pulse">
            WINNER!
          </DialogTitle>

          <DialogDescription className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {winAmount ? winAmount.toFixed(2) : '0.00'} SC!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Prize Amount Display */}
          <div className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 rounded-xl p-8 text-center border-4 border-yellow-400 dark:border-yellow-600 shadow-2xl transform hover:scale-105 transition-transform">
            <p className="text-sm font-black text-yellow-800 dark:text-yellow-200 uppercase tracking-widest mb-2">Instant Win!</p>
            <p className="text-6xl font-black text-yellow-600 dark:text-yellow-400 drop-shadow-md">
              {winAmount ? winAmount.toFixed(2) : '0.00'}
            </p>
            <p className="text-xl font-black text-gray-800 dark:text-gray-200 mt-2">
              Sweeps Coins (SC)
            </p>
          </div>

          {/* Celebration Message */}
          <div className="text-center space-y-2">
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Congratulations! You hit a winner!
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click the big button below to redeem your instant win now!
            </p>
          </div>

          {/* Social Share Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
              Share Your Win! 🎉
            </p>
            <Button
              onClick={handleFacebookShare}
              disabled={isSharing || isClaiming}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSharing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sharing...
                </>
              ) : hasShared ? (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Shared on Facebook ✓
                </>
              ) : (
                <>
                  <Facebook className="w-4 h-4 mr-2" />
                  Share on Facebook
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Let your friends know about your amazing win!
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
              className="flex-1 h-20 text-2xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 hover:from-yellow-500 hover:to-orange-600 shadow-xl shadow-orange-500/40 border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all uppercase"
            >
              {isClaiming ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Redeeming...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 mr-2" />
                  REDEEM NOW!
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
